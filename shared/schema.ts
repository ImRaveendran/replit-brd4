import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  epics: jsonb("epics").notNull(),
  status: text("status").notNull().default("processing"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Zod schemas for validation
export const userStorySchema = z.object({
  story_name: z.string(),
  description: z.string(),
  label: z.string(),
  status: z.string(),
  acceptance_criteria: z.array(z.string()),
  nfrs: z.array(z.string()),
  definition_of_done: z.array(z.string()),
  definition_of_ready: z.array(z.string()),
});

export const epicSchema = z.object({
  epic_name: z.string(),
  epic_description: z.string(),
  user_stories: z.array(userStorySchema),
});

export const generationResultSchema = z.object({
  epics: z.array(epicSchema),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  filename: true,
  content: true,
});

export const insertGenerationSchema = createInsertSchema(generations).pick({
  documentId: true,
  epics: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generations.$inferSelect;
export type UserStory = z.infer<typeof userStorySchema>;
export type Epic = z.infer<typeof epicSchema>;
export type GenerationResult = z.infer<typeof generationResultSchema>;
