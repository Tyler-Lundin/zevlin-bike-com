import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { orders } from "./commerce";

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending",
  "purchased",
  "voided",
  "error",
  "delivered",
]);

export const shippingPackages = pgTable("shipping_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  lengthCm: numeric("length_cm").notNull(),
  widthCm: numeric("width_cm").notNull(),
  heightCm: numeric("height_cm").notNull(),
  weightGrams: integer("weight_grams").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    carrier: text("carrier"),
    service: text("service"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    labelUrl: text("label_url"),
    rateObjectId: text("rate_object_id"),
    labelObjectId: text("label_object_id"),
    priceAmountCents: integer("price_amount_cents"),
    priceCurrency: text("price_currency").default("USD"),
    status: shipmentStatusEnum("status").notNull().default("pending"),
    toAddressEncrypted: text("to_address_encrypted"),
    toAddressHash: text("to_address_hash"),
    fromAddressEncrypted: text("from_address_encrypted"),
    fromAddressHash: text("from_address_hash"),
    packageName: text("package_name"),
    weightGrams: integer("weight_grams").notNull(),
    lengthCm: numeric("length_cm").notNull(),
    widthCm: numeric("width_cm").notNull(),
    heightCm: numeric("height_cm").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("shipments_order_idx").on(table.orderId),
    trackingIdx: index("shipments_tracking_idx").on(table.trackingNumber),
    statusIdx: index("shipments_status_idx").on(table.status),
  }),
);

export const shipmentEvents = pgTable(
  "shipment_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    eventCode: text("event_code"),
    description: text("description"),
    raw: jsonb("raw"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    shipmentIdx: index("shipment_events_shipment_idx").on(table.shipmentId),
    occurredAtIdx: index("shipment_events_occurred_at_idx").on(table.occurredAt),
  }),
);

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(),
  providerEventId: text("provider_event_id").notNull().unique(),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
});
