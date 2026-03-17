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
import { customers } from "./identity";
import { syncStatusEnum } from "./enums";

export const fileObjects = pgTable(
  "file_objects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bucket: text("bucket").notNull(),
    objectKey: text("object_key").notNull(),
    kind: text("kind").notNull().default("general"),
    contentType: text("content_type"),
    byteSize: integer("byte_size"),
    checksum: text("checksum"),
    provider: text("provider").notNull().default("minio"),
    metadata: jsonb("metadata"),
    createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    objectKeyUnique: uniqueIndex("file_objects_object_key_uq").on(table.objectKey),
    createdByIdx: index("file_objects_created_by_idx").on(table.createdByCustomerId),
  }),
);

export const externalRecordLinks = pgTable(
  "external_record_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerTable: text("owner_table").notNull(),
    ownerId: text("owner_id").notNull(),
    provider: text("provider").notNull(),
    recordType: text("record_type").notNull(),
    externalId: text("external_id").notNull(),
    url: text("url"),
    metadata: jsonb("metadata"),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    providerRecordUnique: uniqueIndex("external_record_links_provider_record_uq").on(
      table.provider,
      table.recordType,
      table.externalId,
    ),
    ownerRecordUnique: uniqueIndex("external_record_links_owner_provider_type_uq").on(
      table.ownerTable,
      table.ownerId,
      table.provider,
      table.recordType,
    ),
    ownerIdx: index("external_record_links_owner_idx").on(table.ownerTable, table.ownerId),
  }),
);

export const integrationSyncState = pgTable(
  "integration_sync_state",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerTable: text("owner_table").notNull(),
    ownerId: text("owner_id").notNull(),
    provider: text("provider").notNull(),
    syncType: text("sync_type").notNull().default("upsert"),
    status: syncStatusEnum("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: text("last_error"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ownerProviderSyncUnique: uniqueIndex("integration_sync_state_owner_provider_sync_uq").on(
      table.ownerTable,
      table.ownerId,
      table.provider,
      table.syncType,
    ),
    statusIdx: index("integration_sync_state_status_idx").on(table.status),
  }),
);
