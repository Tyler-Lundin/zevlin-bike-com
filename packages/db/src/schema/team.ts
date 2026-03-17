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
import { priceLists } from "./catalog";
import { customers } from "./identity";
import {
  teamApplicationStatusEnum,
  teamMembershipStatusEnum,
  teamRegistrationStatusEnum,
} from "./enums";
import { leadSubmissions } from "./marketing";
import { fileObjects } from "./platform";

export const teamPrograms = pgTable(
  "team_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    priceListId: uuid("price_list_id").references(() => priceLists.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("team_programs_slug_uq").on(table.slug),
  }),
);

export const teamUpdates = pgTable("team_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamProgramId: uuid("team_program_id").references(() => teamPrograms.id, { onDelete: "set null" }),
  directusItemId: text("directus_item_id"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamEvents = pgTable("team_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamProgramId: uuid("team_program_id").references(() => teamPrograms.id, { onDelete: "set null" }),
  directusItemId: text("directus_item_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  location: text("location"),
  capacity: integer("capacity"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamApplications = pgTable(
  "team_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamProgramId: uuid("team_program_id").references(() => teamPrograms.id, {
      onDelete: "set null",
    }),
    submittedByCustomerId: uuid("submitted_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    leadSubmissionId: uuid("lead_submission_id").references(() => leadSubmissions.id, {
      onDelete: "set null",
    }),
    status: teamApplicationStatusEnum("status").notNull().default("submitted"),
    fullName: text("full_name"),
    emailHash: text("email_hash"),
    message: text("message"),
    applicationEncrypted: text("application_encrypted").notNull(),
    reviewedByCustomerId: uuid("reviewed_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    teamProgramIdx: index("team_applications_team_program_idx").on(table.teamProgramId),
    statusIdx: index("team_applications_status_idx").on(table.status),
  }),
);

export const teamMemberships = pgTable(
  "team_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamProgramId: uuid("team_program_id")
      .notNull()
      .references(() => teamPrograms.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    status: teamMembershipStatusEnum("status").notNull().default("pending_review"),
    approvedByCustomerId: uuid("approved_by_customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    priceListId: uuid("price_list_id").references(() => priceLists.id, { onDelete: "set null" }),
    notes: jsonb("notes"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    teamProgramCustomerUnique: uniqueIndex("team_memberships_program_customer_uq").on(
      table.teamProgramId,
      table.customerId,
    ),
    customerIdx: index("team_memberships_customer_idx").on(table.customerId),
  }),
);

export const teamEventRegistrations = pgTable(
  "team_event_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => teamEvents.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    teamMembershipId: uuid("team_membership_id").references(() => teamMemberships.id, {
      onDelete: "set null",
    }),
    status: teamRegistrationStatusEnum("status").notNull().default("pending"),
    registrationEncrypted: text("registration_encrypted").notNull(),
    registrationHash: text("registration_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("team_event_registrations_event_idx").on(table.eventId),
    customerIdx: index("team_event_registrations_customer_idx").on(table.customerId),
  }),
);

export const communityProfiles = pgTable(
  "community_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" })
      .unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    homeRegion: text("home_region"),
    avatarFileId: uuid("avatar_file_id").references(() => fileObjects.id, {
      onDelete: "set null",
    }),
    visibility: text("visibility").notNull().default("public"),
    socialLinks: jsonb("social_links"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerUnique: uniqueIndex("community_profiles_customer_uq").on(table.customerId),
  }),
);

export const teamEventSignups = pgTable("team_event_signups", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => teamEvents.id, { onDelete: "cascade" }),
  signupEncrypted: text("signup_encrypted").notNull(),
  signupHash: text("signup_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
