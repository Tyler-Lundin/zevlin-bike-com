import { index, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customers } from "./identity";

export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "pending",
  "paid",
  "partially_refunded",
  "refunded",
]);

export const orderFulfillmentStatusEnum = pgEnum("order_fulfillment_status", [
  "pending_payment",
  "pending_fulfillment",
  "fulfilled",
  "cancelled",
]);

export const orderShippingStatusEnum = pgEnum("order_shipping_status", [
  "not_shipped",
  "shipped",
  "delivered",
  "returned",
  "lost",
]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    quantityInStock: integer("quantity_in_stock").notNull().default(0),
    weightGrams: integer("weight_grams"),
    lengthCm: numeric("length_cm"),
    widthCm: numeric("width_cm"),
    heightCm: numeric("height_cm"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("products_slug_idx").on(table.slug),
  }),
);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku").unique(),
  priceCents: integer("price_cents"),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  weightGrams: integer("weight_grams"),
  lengthCm: numeric("length_cm"),
  widthCm: numeric("width_cm"),
  heightCm: numeric("height_cm"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
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
    billingAddressEncrypted: text("billing_address_encrypted"),
    billingAddressHash: text("billing_address_hash"),
    shippingAddressEncrypted: text("shipping_address_encrypted"),
    shippingAddressHash: text("shipping_address_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIndex: index("orders_customer_idx").on(table.customerId),
  }),
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
