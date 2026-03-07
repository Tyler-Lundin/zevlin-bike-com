import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@zevlin/contracts";
import { orderItems, orders, withDbSessionContext } from "@zevlin/db";
import { createStripeCheckoutSession } from "@zevlin/integrations";
import { createRequestContext, log } from "@zevlin/observability";
import {
  encryptField,
  hashLookup,
  withApiRateLimit,
} from "@zevlin/security";

function amountFromOrder(payload: ReturnType<typeof createOrderSchema.parse>): number {
  return payload.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
}

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "store", route: "/api/checkout/session" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "store.checkout.session",
        max: 8,
        windowMs: 60_000,
        errorMessage: "Too many checkout attempts",
      },
      async () => {
        try {
          const body = await request.json();
          const parsed = createOrderSchema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              {
                error: "Invalid request body",
                issues: parsed.error.issues,
              },
              { status: 400 },
            );
          }

          const orderId = randomUUID();
          const totalCents = amountFromOrder(parsed.data);
          const billingAddressCipher = encryptField(
            JSON.stringify(parsed.data.billingAddress),
            "billing_address",
          );
          const shippingAddressCipher = encryptField(
            JSON.stringify(parsed.data.shippingAddress),
            "shipping_address",
          );
          const billingAddressHash = hashLookup(
            parsed.data.billingAddress.address1.toLowerCase(),
            "billing_address",
          );
          const shippingAddressHash = hashLookup(
            parsed.data.shippingAddress.address1.toLowerCase(),
            "shipping_address",
          );

          await withDbSessionContext(
            {
              system: true,
              customerId: parsed.data.customerId ?? null,
            },
            async (tx) => {
              await tx.insert(orders).values({
                id: orderId,
                customerId: parsed.data.customerId ?? null,
                paymentStatus: "pending",
                fulfillmentStatus: "pending_payment",
                shippingStatus: "not_shipped",
                subtotalCents: totalCents,
                shippingCostCents: 0,
                taxCents: 0,
                discountCents: 0,
                totalCents,
                billingAddressEncrypted: JSON.stringify(billingAddressCipher),
                billingAddressHash,
                shippingAddressEncrypted: JSON.stringify(shippingAddressCipher),
                shippingAddressHash,
              });

              await tx.insert(orderItems).values(
                parsed.data.items.map((item) => ({
                  orderId,
                  productId: item.productId,
                  variantId: item.variantId ?? null,
                  quantity: item.quantity,
                  unitPriceCents: item.unitPriceCents,
                })),
              );
            },
          );

          const session = await createStripeCheckoutSession({
            amountCents: totalCents,
            currency: "usd",
            successUrl: `${request.nextUrl.origin}/checkout/success`,
            cancelUrl: `${request.nextUrl.origin}/checkout`,
            metadata: {
              source: parsed.data.source,
              orderId,
            },
          });

          return NextResponse.json({
            orderId,
            checkoutSessionId: session.id,
            checkoutUrl: session.url,
          });
        } catch (error) {
          log({
            level: "error",
            message: "Checkout session creation failed",
            context,
            metadata: {
              error: error instanceof Error ? error.message : "unknown_error",
            },
          });

          return NextResponse.json(
            {
              error: "Failed to create checkout session",
            },
            { status: 500 },
          );
        }
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Checkout security guard failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
