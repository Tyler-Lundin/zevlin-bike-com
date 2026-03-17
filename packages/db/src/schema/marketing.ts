import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { customers, organizations } from "./identity";
import { consentTypeEnum, leadSubmissionKindEnum, leadSubmissionStatusEnum } from "./enums";

export const leadSubmissions = pgTable(
  "lead_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: leadSubmissionKindEnum("kind").notNull(),
    status: leadSubmissionStatusEnum("status").notNull().default("new"),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    sourceTable: text("source_table").notNull(),
    sourceRecordId: text("source_record_id").notNull(),
    emailHash: text("email_hash"),
    payloadEncrypted: text("payload_encrypted").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sourceUnique: uniqueIndex("lead_submissions_source_uq").on(table.sourceTable, table.sourceRecordId),
    kindIdx: index("lead_submissions_kind_idx").on(table.kind),
    customerIdx: index("lead_submissions_customer_idx").on(table.customerId),
  }),
);

export const marketingConsents = pgTable(
  "marketing_consents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    leadSubmissionId: uuid("lead_submission_id").references(() => leadSubmissions.id, {
      onDelete: "set null",
    }),
    emailHash: text("email_hash").notNull(),
    consentType: consentTypeEnum("consent_type").notNull(),
    granted: boolean("granted").notNull().default(true),
    source: text("source"),
    capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailConsentUnique: uniqueIndex("marketing_consents_email_type_uq").on(
      table.emailHash,
      table.consentType,
    ),
    leadSubmissionIdx: index("marketing_consents_lead_submission_idx").on(table.leadSubmissionId),
  }),
);

export const marketingNewsletterSignups = pgTable(
  "marketing_newsletter_signups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailEncrypted: text("email_encrypted").notNull(),
    emailHash: text("email_hash").notNull().unique(),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailHashIdx: index("marketing_newsletter_signups_email_hash_idx").on(table.emailHash),
    createdAtIdx: index("marketing_newsletter_signups_created_at_idx").on(table.createdAt),
  }),
);

export const marketingContactSubmissions = pgTable(
  "marketing_contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionEncrypted: text("submission_encrypted").notNull(),
    emailHash: text("email_hash").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailHashIdx: index("marketing_contact_submissions_email_hash_idx").on(table.emailHash),
    statusIdx: index("marketing_contact_submissions_status_idx").on(table.status),
    createdAtIdx: index("marketing_contact_submissions_created_at_idx").on(table.createdAt),
  }),
);

export const marketingReturnRequests = pgTable(
  "marketing_return_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull(),
    requestEncrypted: text("request_encrypted").notNull(),
    emailHash: text("email_hash"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderNumberIdx: index("marketing_return_requests_order_number_idx").on(table.orderNumber),
    emailHashIdx: index("marketing_return_requests_email_hash_idx").on(table.emailHash),
    statusIdx: index("marketing_return_requests_status_idx").on(table.status),
    createdAtIdx: index("marketing_return_requests_created_at_idx").on(table.createdAt),
  }),
);

export const marketingPrivacyRequests = pgTable(
  "marketing_privacy_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestType: text("request_type").notNull(),
    requestEncrypted: text("request_encrypted").notNull(),
    emailHash: text("email_hash").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    requestTypeIdx: index("marketing_privacy_requests_request_type_idx").on(table.requestType),
    emailHashIdx: index("marketing_privacy_requests_email_hash_idx").on(table.emailHash),
    statusIdx: index("marketing_privacy_requests_status_idx").on(table.status),
    createdAtIdx: index("marketing_privacy_requests_created_at_idx").on(table.createdAt),
  }),
);
