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
import { discountCodeStatusEnum, benefitTypeEnum } from "./enums";
import { priceLists } from "./catalog";
import { teamMemberships, teamPrograms } from "./team";

export const benefitPrograms = pgTable(
  "benefit_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    benefitType: benefitTypeEnum("benefit_type").notNull(),
    description: text("description"),
    teamProgramId: uuid("team_program_id").references(() => teamPrograms.id, {
      onDelete: "set null",
    }),
    priceListId: uuid("price_list_id").references(() => priceLists.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("benefit_programs_slug_uq").on(table.slug),
    teamProgramIdx: index("benefit_programs_team_program_idx").on(table.teamProgramId),
  }),
);

export const benefitEntitlements = pgTable(
  "benefit_entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    benefitProgramId: uuid("benefit_program_id")
      .notNull()
      .references(() => benefitPrograms.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    teamMembershipId: uuid("team_membership_id").references(() => teamMemberships.id, {
      onDelete: "set null",
    }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("active"),
    grantedByCustomerId: uuid("granted_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    benefitProgramIdx: index("benefit_entitlements_program_idx").on(table.benefitProgramId),
    customerIdx: index("benefit_entitlements_customer_idx").on(table.customerId),
    membershipIdx: index("benefit_entitlements_membership_idx").on(table.teamMembershipId),
  }),
);

export const discountCodes = pgTable(
  "discount_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    benefitProgramId: uuid("benefit_program_id").references(() => benefitPrograms.id, {
      onDelete: "set null",
    }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull().unique(),
    status: discountCodeStatusEnum("status").notNull().default("active"),
    percentOff: integer("percent_off"),
    amountOffCents: integer("amount_off_cents"),
    currency: text("currency").notNull().default("USD"),
    maxRedemptions: integer("max_redemptions"),
    redemptionCount: integer("redemption_count").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    codeUnique: uniqueIndex("discount_codes_code_uq").on(table.code),
    benefitProgramIdx: index("discount_codes_program_idx").on(table.benefitProgramId),
    customerIdx: index("discount_codes_customer_idx").on(table.customerId),
  }),
);
