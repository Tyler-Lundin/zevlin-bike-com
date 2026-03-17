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
import { customers, organizations } from "./identity";
import {
  orderCheckoutStatusEnum,
  orderFulfillmentStatusEnum,
  orderPaymentStatusEnum,
  orderShippingStatusEnum,
  paymentProviderEnum,
  productStatusEnum,
  salesChannelEnum,
} from "./enums";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    status: productStatusEnum("status").notNull().default("active"),
    productType: text("product_type").notNull().default("physical"),
    currency: text("currency").notNull().default("USD"),
    priceCents: integer("price_cents").notNull(),
    requiresShipping: boolean("requires_shipping").notNull().default(true),
    isTeamOnly: boolean("is_team_only").notNull().default(false),
    quantityInStock: integer("quantity_in_stock").notNull().default(0),
    weightGrams: integer("weight_grams"),
    lengthCm: numeric("length_cm"),
    widthCm: numeric("width_cm"),
    heightCm: numeric("height_cm"),
    directusItemId: text("directus_item_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("products_slug_idx").on(table.slug),
    statusIdx: index("products_status_idx").on(table.status),
  }),
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug"),
    sku: text("sku").unique(),
    barcode: text("barcode"),
    status: productStatusEnum("status").notNull().default("active"),
    currency: text("currency").notNull().default("USD"),
    isDefault: boolean("is_default").notNull().default(false),
    priceCents: integer("price_cents"),
    compareAtPriceCents: integer("compare_at_price_cents"),
    quantityInStock: integer("quantity_in_stock").notNull().default(0),
    weightGrams: integer("weight_grams"),
    lengthCm: numeric("length_cm"),
    widthCm: numeric("width_cm"),
    heightCm: numeric("height_cm"),
    attributes: jsonb("attributes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("product_variants_product_idx").on(table.productId),
    skuUnique: uniqueIndex("product_variants_sku_uq").on(table.sku),
  }),
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    buyerOrganizationId: uuid("buyer_organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    channel: salesChannelEnum("channel").notNull().default("store"),
    currency: text("currency").notNull().default("USD"),
    checkoutStatus: orderCheckoutStatusEnum("checkout_status").notNull().default("draft"),
    orderNumber: text("order_number"),
    emailEncrypted: text("email_encrypted"),
    emailHash: text("email_hash"),
    paymentStatus: orderPaymentStatusEnum("payment_status").notNull().default("pending"),
    fulfillmentStatus: orderFulfillmentStatusEnum("fulfillment_status")
      .notNull()
      .default("pending_payment"),
    shippingStatus: orderShippingStatusEnum("shipping_status").notNull().default("not_shipped"),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCostCents: integer("shipping_cost_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    billingAddressEncrypted: text("billing_address_encrypted"),
    billingAddressHash: text("billing_address_hash"),
    billingAddressSnapshot: jsonb("billing_address_snapshot"),
    shippingAddressEncrypted: text("shipping_address_encrypted"),
    shippingAddressHash: text("shipping_address_hash"),
    shippingAddressSnapshot: jsonb("shipping_address_snapshot"),
    sourceMetadata: jsonb("source_metadata"),
    placedAt: timestamp("placed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIndex: index("orders_customer_idx").on(table.customerId),
    organizationIdx: index("orders_buyer_organization_idx").on(table.buyerOrganizationId),
    orderNumberUnique: uniqueIndex("orders_order_number_uq").on(table.orderNumber),
  }),
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    title: text("title"),
    productSlug: text("product_slug"),
    variantName: text("variant_name"),
    sku: text("sku"),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    weightGrams: integer("weight_grams"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
  }),
);

export const orderAdjustments = pgTable(
  "order_adjustments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    label: text("label").notNull(),
    amountCents: integer("amount_cents").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("order_adjustments_order_idx").on(table.orderId),
  }),
);

export const paymentAttempts = pgTable(
  "payment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    status: text("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    externalCheckoutSessionId: text("external_checkout_session_id"),
    externalPaymentIntentId: text("external_payment_intent_id"),
    metadata: jsonb("metadata"),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("payment_attempts_order_idx").on(table.orderId),
    checkoutSessionUnique: uniqueIndex("payment_attempts_checkout_session_uq").on(
      table.externalCheckoutSessionId,
    ),
  }),
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    paymentAttemptId: uuid("payment_attempt_id").references(() => paymentAttempts.id, {
      onDelete: "set null",
    }),
    provider: paymentProviderEnum("provider").notNull(),
    status: text("status").notNull().default("pending"),
    externalRefundId: text("external_refund_id"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("refunds_order_idx").on(table.orderId),
    externalRefundUnique: uniqueIndex("refunds_external_refund_uq").on(table.externalRefundId),
  }),
);
