import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Articles table for DOU monitoring
 * Stores articles scraped from the Diário Oficial da União
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique identifier from DOU (classPK) */
  classPK: varchar("classPK", { length: 255 }).notNull().unique(),
  /** Article title */
  title: text("title").notNull(),
  /** URL to the article */
  url: text("url").notNull(),
  /** Section/Seção (e.g., "Seção 1", "Seção 2") */
  section: varchar("section", { length: 100 }),
  /** Publication date */
  date: varchar("date", { length: 50 }),
  /** Article summary/abstract */
  summary: text("summary"),
  /** Full article text */
  fullText: text("fullText"),
  /** When the article was fetched */
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  /** When the record was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When the record was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;