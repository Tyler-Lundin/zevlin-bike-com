import { NextRequest, NextResponse } from "next/server";
import { AccessDeniedError, requireMfa, requireRole } from "@zevlin/auth";
import { rateRequestSchema, type RateOption } from "@zevlin/contracts";
import { getShippoRates } from "@zevlin/integrations";
import { createRequestContext, log } from "@zevlin/observability";
import { withApiRateLimit } from "@zevlin/security";
import { getSessionFromRequest } from "../../../../lib/session";

const defaultFromAddress = {
  name: "Zevlin Warehouse",
  street1: "123 Bike Way",
  city: "Columbus",
  state: "OH",
  zip: "43004",
  country: "US",
  phone: "5555555555",
  email: "ops@zevlin.com",
};

const defaultToAddress = {
  name: "Customer",
  street1: "1600 Pennsylvania Ave NW",
  city: "Washington",
  state: "DC",
  zip: "20500",
  country: "US",
  phone: "5555550000",
  email: "customer@example.com",
};

const defaultParcel = {
  length: "20",
  width: "15",
  height: "10",
  distance_unit: "cm" as const,
  weight: "800",
  mass_unit: "g" as const,
};

function normalizeRates(raw: unknown): RateOption[] {
  const payload = raw as { rates?: Array<Record<string, unknown>> };
  return (
    payload.rates?.map((rate) => {
      const serviceLevel = (rate["servicelevel"] ?? null) as { name?: unknown } | null;
      const estimatedDays = rate["estimated_days"];

      return {
        rateObjectId: String(rate["object_id"] ?? ""),
        carrier: String(rate["provider"] ?? "unknown"),
        service: String(serviceLevel?.name ?? rate["servicelevel_token"] ?? "standard"),
        amountCents: Math.round(Number(rate["amount"] ?? 0) * 100),
        currency: String(rate["currency"] ?? "USD"),
        estimatedDays:
          typeof estimatedDays === "number" && Number.isFinite(estimatedDays)
            ? estimatedDays
            : undefined,
      };
    }) ?? []
  );
}

function localMockRates(): RateOption[] {
  return [
    {
      rateObjectId: "mock_usps_priority",
      carrier: "USPS",
      service: "Priority",
      amountCents: 1299,
      currency: "USD",
      estimatedDays: 3,
    },
    {
      rateObjectId: "mock_ups_ground",
      carrier: "UPS",
      service: "Ground",
      amountCents: 1599,
      currency: "USD",
      estimatedDays: 4,
    },
  ];
}

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "admin", route: "/api/shipping/rates" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "admin.shipping.rates",
        max: 24,
        windowMs: 60_000,
      },
      async () => {
        const session = await getSessionFromRequest(request);
        requireRole({ session }, "ops");
        requireMfa({ session });

        const body = await request.json();
        const parsed = rateRequestSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
        }

        const dbRuntime = await import("@zevlin/db");
        try {
          const raw = await getShippoRates({
            addressFrom: defaultFromAddress,
            addressTo: defaultToAddress,
            parcel: defaultParcel,
          });
          const rates = normalizeRates(raw);

          await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
            for (const rate of rates) {
              await tx
                .insert(dbRuntime.shipmentRates)
                .values({
                  orderId: parsed.data.orderId,
                  provider: "shippo",
                  providerRateId: rate.rateObjectId,
                  carrier: rate.carrier,
                  service: rate.service,
                  amountCents: rate.amountCents,
                  currency: rate.currency,
                  estimatedDays: rate.estimatedDays,
                  metadata: {
                    source: "shippo",
                  },
                })
                .onConflictDoUpdate({
                  target: [
                    dbRuntime.shipmentRates.orderId,
                    dbRuntime.shipmentRates.providerRateId,
                  ],
                  set: {
                    carrier: rate.carrier,
                    service: rate.service,
                    amountCents: rate.amountCents,
                    currency: rate.currency,
                    estimatedDays: rate.estimatedDays,
                    metadata: {
                      source: "shippo",
                    },
                    updatedAt: new Date(),
                  },
                });
            }
          });

          return NextResponse.json({ orderId: parsed.data.orderId, rates });
        } catch (integrationError) {
          log({
            level: "warn",
            message: "Shippo unavailable, returning local mock rates",
            context,
            metadata: {
              orderId: parsed.data.orderId,
              reason: integrationError instanceof Error ? integrationError.message : "unknown",
            },
          });

          const rates = localMockRates();
          await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
            for (const rate of rates) {
              await tx
                .insert(dbRuntime.shipmentRates)
                .values({
                  orderId: parsed.data.orderId,
                  provider: "manual",
                  providerRateId: rate.rateObjectId,
                  carrier: rate.carrier,
                  service: rate.service,
                  amountCents: rate.amountCents,
                  currency: rate.currency,
                  estimatedDays: rate.estimatedDays,
                  metadata: {
                    source: "mock",
                  },
                })
                .onConflictDoUpdate({
                  target: [
                    dbRuntime.shipmentRates.orderId,
                    dbRuntime.shipmentRates.providerRateId,
                  ],
                  set: {
                    carrier: rate.carrier,
                    service: rate.service,
                    amountCents: rate.amountCents,
                    currency: rate.currency,
                    estimatedDays: rate.estimatedDays,
                    metadata: {
                      source: "mock",
                    },
                    updatedAt: new Date(),
                  },
                });
            }
          });

          return NextResponse.json({
            orderId: parsed.data.orderId,
            rates,
            mode: "mock",
          });
        }
      },
    );
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    log({
      level: "error",
      message: "Admin shipping rates failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
