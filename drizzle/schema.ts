import { boolean, int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

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

/** Persistent seller edits shared by the store dashboard and mobile clients. */
export const sellerProductOverrides = mysqlTable("seller_product_overrides", {
  id: varchar("id", { length: 160 }).primaryKey(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 128 }).notNull(),
  description: text("description"),
  imageUri: mediumtext("imageUri"),
  imageUris: mediumtext("imageUris"),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerProductUnique: unique("seller_owner_product_unique").on(table.ownerOpenId, table.productId),
}));

export type SellerProductOverride = typeof sellerProductOverrides.$inferSelect;
export type InsertSellerProductOverride = typeof sellerProductOverrides.$inferInsert;
