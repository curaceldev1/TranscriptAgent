import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sources = pgTable("sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // "youtube", "webpage", "pdf", etc.
  status: text("status").notNull().default("processing"), // "processing", "ready", "error"
  content: text("content"), // extracted content/transcript
  extractedAt: timestamp("extracted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  errorMessage: text("error_message"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  sourceIds: text("source_ids").array(), // references to sources used
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
  extractedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type User = {
  id: string;
  username: string;
  password: string;
};

export type InsertUser = {
  username: string;
  password: string;
};
