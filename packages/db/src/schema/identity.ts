import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "customer",
  "admin",
  "ops",
  "b2b_applicant",
  "b2b_customer",
  "team_editor",
]);

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
