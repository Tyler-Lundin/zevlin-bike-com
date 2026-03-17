import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  organizationMembershipRoleEnum,
  organizationMembershipStatusEnum,
  organizationTypeEnum,
  roleEnum,
} from "./enums";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phoneEncrypted: text("phone_encrypted"),
    phoneHash: text("phone_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    emailIndex: uniqueIndex("customers_email_unique").on(table.email),
    phoneHashIndex: index("customers_phone_hash_idx").on(table.phoneHash),
  }),
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("default"),
    recipientName: text("recipient_name").notNull(),
    phoneEncrypted: text("phone_encrypted"),
    phoneHash: text("phone_hash"),
    addressEncrypted: text("address_encrypted").notNull(),
    addressHash: text("address_hash").notNull(),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index("customer_addresses_customer_idx").on(table.customerId),
    addressHashIdx: index("customer_addresses_address_hash_idx").on(table.addressHash),
  }),
);

export const customerPreferences = pgTable("customer_preferences", {
  customerId: uuid("customer_id")
    .primaryKey()
    .references(() => customers.id, { onDelete: "cascade" }),
  marketingEmailOptIn: boolean("marketing_email_opt_in").notNull().default(false),
  marketingSmsOptIn: boolean("marketing_sms_opt_in").notNull().default(false),
  preferredCurrency: text("preferred_currency").notNull().default("USD"),
  preferredLocale: text("preferred_locale").notNull().default("en-US"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    type: organizationTypeEnum("type").notNull(),
    status: text("status").notNull().default("active"),
    primaryEmail: text("primary_email"),
    phoneEncrypted: text("phone_encrypted"),
    phoneHash: text("phone_hash"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("organizations_slug_uq").on(table.slug),
    typeIdx: index("organizations_type_idx").on(table.type),
  }),
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    role: organizationMembershipRoleEnum("role").notNull(),
    status: organizationMembershipStatusEnum("status").notNull().default("active"),
    title: text("title"),
    invitedByCustomerId: uuid("invited_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationCustomerRoleUnique: uniqueIndex("organization_memberships_org_customer_role_uq").on(
      table.organizationId,
      table.customerId,
      table.role,
    ),
    customerIdx: index("organization_memberships_customer_idx").on(table.customerId),
  }),
);

export const organizationLocations = pgTable(
  "organization_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("shipping"),
    name: text("name"),
    email: text("email"),
    phoneEncrypted: text("phone_encrypted"),
    phoneHash: text("phone_hash"),
    addressEncrypted: text("address_encrypted").notNull(),
    addressHash: text("address_hash").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdx: index("organization_locations_org_idx").on(table.organizationId),
    addressHashIdx: index("organization_locations_address_hash_idx").on(table.addressHash),
  }),
);

export const staffMfaState = pgTable("staff_mfa_state", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").notNull().unique(),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerRoleUnique: uniqueIndex("user_roles_customer_role_uq").on(table.customerId, table.role),
  }),
);

export const identityLinks = pgTable(
  "identity_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull().default("authentik"),
    subject: text("subject").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    email: text("email"),
    claims: jsonb("claims"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    providerSubjectUnique: unique("identity_links_provider_subject_uq").on(
      table.provider,
      table.subject,
    ),
    customerIdx: index("identity_links_customer_idx").on(table.customerId),
  }),
);

export const refreshTokenSessions = pgTable(
  "refresh_token_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identityLinkId: uuid("identity_link_id")
      .notNull()
      .references(() => identityLinks.id, { onDelete: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull().unique(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    identityIdx: index("refresh_token_sessions_identity_idx").on(table.identityLinkId),
    expiresIdx: index("refresh_token_sessions_expires_idx").on(table.expiresAt),
  }),
);
