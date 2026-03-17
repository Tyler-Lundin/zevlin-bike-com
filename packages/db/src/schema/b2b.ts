import {
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
  b2bApplicationStatusEnum,
  b2bBusinessTypeEnum,
  b2bInquiryTypeEnum,
  b2bQuoteStatusEnum,
} from "./enums";
import { leadSubmissions } from "./marketing";
import { orders } from "./commerce";

export const b2bAccounts = pgTable(
  "b2b_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    companyName: text("company_name").notNull(),
    pricingTier: text("pricing_tier").notNull().default("standard"),
    contactEncrypted: text("contact_encrypted").notNull(),
    contactHash: text("contact_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationUnique: uniqueIndex("b2b_accounts_organization_uq").on(table.organizationId),
    contactHashIdx: index("b2b_accounts_contact_hash_idx").on(table.contactHash),
  }),
);

export const b2bApplications = pgTable(
  "b2b_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id").references(() => b2bAccounts.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    leadSubmissionId: uuid("lead_submission_id").references(() => leadSubmissions.id, {
      onDelete: "set null",
    }),
    submittedByCustomerId: uuid("submitted_by_customer_id").references(() => customers.id),
    companyName: text("company_name"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    businessType: b2bBusinessTypeEnum("business_type"),
    inquiryType: b2bInquiryTypeEnum("inquiry_type"),
    location: text("location"),
    taxId: text("tax_id"),
    website: text("website"),
    notes: text("notes"),
    applicationEncrypted: text("application_encrypted").notNull(),
    applicationHash: text("application_hash").notNull(),
    status: b2bApplicationStatusEnum("status").notNull().default("submitted"),
    reviewedByCustomerId: uuid("reviewed_by_customer_id").references(() => customers.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("b2b_applications_status_idx").on(table.status),
    organizationIdx: index("b2b_applications_org_idx").on(table.organizationId),
    leadSubmissionIdx: index("b2b_applications_lead_submission_idx").on(table.leadSubmissionId),
  }),
);

export const b2bQuotes = pgTable(
  "b2b_quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id").references(() => b2bAccounts.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    quoteNumber: text("quote_number"),
    status: b2bQuoteStatusEnum("status").notNull().default("draft"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    requestedByCustomerId: uuid("requested_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id),
    sourceApplicationId: uuid("source_application_id").references(() => b2bApplications.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("b2b_quotes_org_idx").on(table.organizationId),
    quoteNumberUnique: uniqueIndex("b2b_quotes_quote_number_uq").on(table.quoteNumber),
  }),
);

export const b2bQuoteItems = pgTable(
  "b2b_quote_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => b2bQuotes.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id"),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    quoteIdx: index("b2b_quote_items_quote_idx").on(table.quoteId),
  }),
);

export const b2bQuoteStatusEvents = pgTable(
  "b2b_quote_status_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => b2bQuotes.id, { onDelete: "cascade" }),
    status: b2bQuoteStatusEnum("status").notNull(),
    note: text("note"),
    changedByCustomerId: uuid("changed_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    quoteIdx: index("b2b_quote_status_events_quote_idx").on(table.quoteId),
  }),
);

export const b2bQuoteOrderConversions = pgTable(
  "b2b_quote_order_conversions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => b2bQuotes.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    convertedByCustomerId: uuid("converted_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    quoteUnique: uniqueIndex("b2b_quote_order_conversions_quote_uq").on(table.quoteId),
    orderUnique: uniqueIndex("b2b_quote_order_conversions_order_uq").on(table.orderId),
  }),
);
