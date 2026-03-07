import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customers } from "./identity";

export const teamUpdates = pgTable("team_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamEvents = pgTable("team_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  location: text("location"),
  createdByCustomerId: uuid("created_by_customer_id").references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamEventSignups = pgTable("team_event_signups", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => teamEvents.id, { onDelete: "cascade" }),
  signupEncrypted: text("signup_encrypted").notNull(),
  signupHash: text("signup_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
