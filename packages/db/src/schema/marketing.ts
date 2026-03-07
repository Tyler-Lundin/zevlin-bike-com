import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
