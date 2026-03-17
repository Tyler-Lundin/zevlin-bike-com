import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { orderItems, orders, products, productVariants } from "./commerce";
import { customers } from "./identity";
import { fileObjects } from "./platform";
import { returnRequestStatusEnum, shipmentStatusEnum, shippingProviderEnum } from "./enums";

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

export const shipmentRates = pgTable(
  "shipment_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: shippingProviderEnum("provider").notNull().default("shippo"),
    providerRateId: text("provider_rate_id").notNull(),
    carrier: text("carrier").notNull(),
    service: text("service").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    estimatedDays: integer("estimated_days"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("shipment_rates_order_idx").on(table.orderId),
    providerRateUnique: uniqueIndex("shipment_rates_order_provider_rate_uq").on(
      table.orderId,
      table.providerRateId,
    ),
  }),
);

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    shipmentRateId: uuid("shipment_rate_id").references(() => shipmentRates.id, {
      onDelete: "set null",
    }),
    provider: shippingProviderEnum("provider").notNull().default("shippo"),
    externalShipmentId: text("external_shipment_id"),
    carrier: text("carrier"),
    service: text("service"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    labelUrl: text("label_url"),
    rateObjectId: text("rate_object_id"),
    labelObjectId: text("label_object_id"),
    fileObjectId: uuid("file_object_id").references(() => fileObjects.id, { onDelete: "set null" }),
    priceAmountCents: integer("price_amount_cents"),
    priceCurrency: text("price_currency").default("USD"),
    status: shipmentStatusEnum("status").notNull().default("pending"),
    toAddressEncrypted: text("to_address_encrypted"),
    toAddressHash: text("to_address_hash"),
    fromAddressEncrypted: text("from_address_encrypted"),
    fromAddressHash: text("from_address_hash"),
    packageName: text("package_name"),
    weightGrams: integer("weight_grams").notNull().default(0),
    lengthCm: numeric("length_cm").notNull().default("0"),
    widthCm: numeric("width_cm").notNull().default("0"),
    heightCm: numeric("height_cm").notNull().default("0"),
    metadata: jsonb("metadata"),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("shipments_order_idx").on(table.orderId),
    shipmentRateIdx: index("shipments_rate_idx").on(table.shipmentRateId),
    trackingIdx: index("shipments_tracking_idx").on(table.trackingNumber),
    statusIdx: index("shipments_status_idx").on(table.status),
  }),
);

export const shipmentTrackingEvents = pgTable(
  "shipment_tracking_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    eventCode: text("event_code"),
    externalEventId: text("external_event_id"),
    description: text("description"),
    location: text("location"),
    raw: jsonb("raw"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    shipmentIdx: index("shipment_tracking_events_shipment_idx").on(table.shipmentId),
    occurredAtIdx: index("shipment_tracking_events_occurred_at_idx").on(table.occurredAt),
    externalEventIdx: uniqueIndex("shipment_tracking_events_external_event_uq").on(
      table.externalEventId,
    ),
  }),
);

export const shipmentEvents = shipmentTrackingEvents;

export const returnRequests = pgTable(
  "return_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    shipmentId: uuid("shipment_id").references(() => shipments.id, { onDelete: "set null" }),
    status: returnRequestStatusEnum("status").notNull().default("requested"),
    reason: text("reason").notNull(),
    requestEncrypted: text("request_encrypted").notNull(),
    emailHash: text("email_hash"),
    metadata: jsonb("metadata"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("return_requests_order_idx").on(table.orderId),
    customerIdx: index("return_requests_customer_idx").on(table.customerId),
  }),
);

export const returnItems = pgTable(
  "return_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    returnRequestId: uuid("return_request_id")
      .notNull()
      .references(() => returnRequests.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull(),
    condition: text("condition"),
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    returnRequestIdx: index("return_items_return_request_idx").on(table.returnRequestId),
  }),
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    resourceType: text("resource_type"),
    providerEventId: text("provider_event_id").notNull().unique(),
    payload: jsonb("payload"),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    providerEventUnique: uniqueIndex("webhook_events_provider_event_uq").on(table.providerEventId),
  }),
);
