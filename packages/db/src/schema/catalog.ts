import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { customers, organizations } from "./identity";
import {
  inventoryLocationKindEnum,
  inventoryMovementReasonEnum,
  priceListStatusEnum,
  salesChannelEnum,
} from "./enums";
import { fileObjects } from "./platform";
import { products, productVariants } from "./commerce";

export const productMediaRefs = pgTable(
  "product_media_refs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    fileObjectId: uuid("file_object_id").references(() => fileObjects.id, { onDelete: "set null" }),
    directusAssetId: text("directus_asset_id"),
    url: text("url"),
    altText: text("alt_text").notNull(),
    label: text("label"),
    purpose: text("purpose").notNull().default("gallery"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("product_media_refs_product_idx").on(table.productId),
    variantIdx: index("product_media_refs_variant_idx").on(table.variantId),
    fileIdx: index("product_media_refs_file_idx").on(table.fileObjectId),
  }),
);

export const productCollections = pgTable(
  "product_collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("product_collections_slug_uq").on(table.slug),
  }),
);

export const productCollectionItems = pgTable(
  "product_collection_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => productCollections.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    collectionProductUnique: uniqueIndex("product_collection_items_collection_product_uq").on(
      table.collectionId,
      table.productId,
    ),
    collectionIdx: index("product_collection_items_collection_idx").on(table.collectionId),
  }),
);

export const inventoryLocations = pgTable(
  "inventory_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    kind: inventoryLocationKindEnum("kind").notNull().default("warehouse"),
    isPrimary: boolean("is_primary").notNull().default(false),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    codeUnique: uniqueIndex("inventory_locations_code_uq").on(table.code),
  }),
);

export const inventoryLevels = pgTable(
  "inventory_levels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => inventoryLocations.id, { onDelete: "cascade" }),
    onHandQuantity: integer("on_hand_quantity").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
    availableQuantity: integer("available_quantity").notNull().default(0),
    safetyStockQuantity: integer("safety_stock_quantity").notNull().default(0),
    reorderPointQuantity: integer("reorder_point_quantity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    variantLocationUnique: uniqueIndex("inventory_levels_variant_location_uq").on(
      table.variantId,
      table.locationId,
    ),
    locationIdx: index("inventory_levels_location_idx").on(table.locationId),
  }),
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => inventoryLocations.id, { onDelete: "cascade" }),
    reason: inventoryMovementReasonEnum("reason").notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    note: text("note"),
    metadata: jsonb("metadata"),
    createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    variantIdx: index("inventory_movements_variant_idx").on(table.variantId),
    locationIdx: index("inventory_movements_location_idx").on(table.locationId),
    reasonIdx: index("inventory_movements_reason_idx").on(table.reason),
  }),
);

export const priceLists = pgTable(
  "price_lists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    status: priceListStatusEnum("status").notNull().default("active"),
    currency: text("currency").notNull().default("USD"),
    channel: salesChannelEnum("channel"),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("price_lists_slug_uq").on(table.slug),
    orgIdx: index("price_lists_org_idx").on(table.organizationId),
  }),
);

export const priceListItems = pgTable(
  "price_list_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => priceLists.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    currency: text("currency").notNull().default("USD"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    compareAtPriceCents: integer("compare_at_price_cents"),
    minQuantity: integer("min_quantity").notNull().default(1),
    maxQuantity: integer("max_quantity"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    priceListVariantQtyUnique: uniqueIndex("price_list_items_price_variant_qty_uq").on(
      table.priceListId,
      table.variantId,
      table.minQuantity,
    ),
    priceListIdx: index("price_list_items_price_list_idx").on(table.priceListId),
  }),
);

export const priceListAssignments = pgTable(
  "price_list_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => priceLists.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    assignedByCustomerId: uuid("assigned_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    reason: text("reason"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    priceListIdx: index("price_list_assignments_price_list_idx").on(table.priceListId),
    customerIdx: index("price_list_assignments_customer_idx").on(table.customerId),
    orgIdx: index("price_list_assignments_org_idx").on(table.organizationId),
  }),
);
