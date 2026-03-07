import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customers } from "./identity";

export const b2bApplicationStatusEnum = pgEnum("b2b_application_status", [
  "submitted",
  "approved",
  "rejected",
]);

export const b2bQuoteStatusEnum = pgEnum("b2b_quote_status", [
  "draft",
  "sent",
  "accepted",
  "expired",
  "cancelled",
]);

export const b2bAccounts = pgTable("b2b_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: text("company_name").notNull(),
  pricingTier: text("pricing_tier").notNull().default("standard"),
  contactEncrypted: text("contact_encrypted").notNull(),
  contactHash: text("contact_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const b2bApplications = pgTable("b2b_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => b2bAccounts.id, { onDelete: "set null" }),
  submittedByCustomerId: uuid("submitted_by_customer_id").references(() => customers.id),
  applicationEncrypted: text("application_encrypted").notNull(),
  applicationHash: text("application_hash").notNull(),
  status: b2bApplicationStatusEnum("status").notNull().default("submitted"),
  reviewedByCustomerId: uuid("reviewed_by_customer_id").references(() => customers.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const b2bQuotes = pgTable("b2b_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => b2bAccounts.id, { onDelete: "cascade" }),
  status: b2bQuoteStatusEnum("status").notNull().default("draft"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
