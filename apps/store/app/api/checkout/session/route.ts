import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@zevlin/contracts";
import { createStripeCheckoutSession } from "@zevlin/integrations";
import { createRequestContext, log } from "@zevlin/observability";
import {
  encryptField,
  hashLookup,
  withApiRateLimit,
} from "@zevlin/security";
import {
  getShippingCents,
  getSubtotalCents,
  getTotalCents,
} from "../../../../lib/commerce";

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
          const channel = parsed.data.channel ?? parsed.data.source;
          const currency = (parsed.data.currency ?? "USD").toUpperCase();
          const subtotalCents = getSubtotalCents(
            parsed.data.items.map((item) => ({
              priceCents: item.unitPriceCents,
              quantity: item.quantity,
            })),
          );
          const shippingCents = getShippingCents(subtotalCents);
          const totalCents = getTotalCents(subtotalCents);
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
          const emailCipher = parsed.data.email
            ? encryptField(parsed.data.email.toLowerCase(), "generic")
            : null;
          const emailHash = parsed.data.email
            ? hashLookup(parsed.data.email.toLowerCase(), "generic")
            : null;
          const dbRuntime = await import("@zevlin/db");

          await dbRuntime.withDbSessionContext(
            {
              system: true,
              customerId: parsed.data.customerId ?? null,
            },
            async (tx) => {
              await tx.insert(dbRuntime.orders).values({
                id: orderId,
                customerId: parsed.data.customerId ?? null,
                buyerOrganizationId: parsed.data.buyerOrganizationId ?? null,
                channel,
                currency,
                checkoutStatus: "draft",
                emailEncrypted: emailCipher ? JSON.stringify(emailCipher) : null,
                emailHash,
                paymentStatus: "pending",
                fulfillmentStatus: "pending_payment",
                shippingStatus: "not_shipped",
                subtotalCents,
                shippingCostCents: shippingCents,
                taxCents: 0,
                discountCents: 0,
                totalCents,
                billingAddressEncrypted: JSON.stringify(billingAddressCipher),
                billingAddressHash,
                billingAddressSnapshot: parsed.data.billingAddress,
                shippingAddressEncrypted: JSON.stringify(shippingAddressCipher),
                shippingAddressHash,
                shippingAddressSnapshot: parsed.data.shippingAddress,
                sourceMetadata: {
                  source: parsed.data.source,
                  createdFrom: "/api/checkout/session",
                },
              });

              await tx.insert(dbRuntime.orderItems).values(
                parsed.data.items.map((item) => ({
                  orderId,
                  productId: item.productId,
                  variantId: item.variantId ?? null,
                  quantity: item.quantity,
                  unitPriceCents: item.unitPriceCents,
                  weightGrams: item.weightGrams,
                })),
              );
            },
          );

          const session = await createStripeCheckoutSession({
            amountCents: totalCents,
            currency: "usd",
            successUrl: `${request.nextUrl.origin}/checkout/success`,
            cancelUrl: `${request.nextUrl.origin}/checkout?cancelled=1`,
            metadata: {
              source: channel,
              orderId,
            },
          });

          await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
            await tx
              .update(dbRuntime.orders)
              .set({
                stripeCheckoutSessionId: session.id,
                checkoutStatus: "checkout_created",
                updatedAt: new Date(),
              })
              .where(dbRuntime.eq(dbRuntime.orders.id, orderId));

            await tx.insert(dbRuntime.paymentAttempts).values({
              orderId,
              provider: "stripe",
              status: "checkout_created",
              amountCents: totalCents,
              currency,
              externalCheckoutSessionId: session.id,
              metadata: {
                checkoutUrl: session.url,
              },
            });

            await tx
              .insert(dbRuntime.externalRecordLinks)
              .values({
                ownerTable: "orders",
                ownerId: orderId,
                provider: "stripe",
                recordType: "checkout_session",
                externalId: session.id,
                url: session.url,
                metadata: {
                  channel,
                },
                syncedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: [
                  dbRuntime.externalRecordLinks.ownerTable,
                  dbRuntime.externalRecordLinks.ownerId,
                  dbRuntime.externalRecordLinks.provider,
                  dbRuntime.externalRecordLinks.recordType,
                ],
                set: {
                  externalId: session.id,
                  url: session.url,
                  metadata: {
                    channel,
                  },
                  syncedAt: new Date(),
                  updatedAt: new Date(),
                },
              });
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
