import { documents, generations, type Document, type InsertDocument, type Generation, type InsertGeneration } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  
  // Generation operations
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGeneration(id: number): Promise<Generation | undefined>;
  updateGenerationStatus(id: number, status: string, epics?: any, completedAt?: Date): Promise<Generation | undefined>;
  getGenerationsByDocument(documentId: number): Promise<Generation[]>;
}

export class DatabaseStorage implements IStorage {
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const [generation] = await db
      .insert(generations)
      .values(insertGeneration)
      .returning();
    return generation;
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    const [generation] = await db.select().from(generations).where(eq(generations.id, id));
    return generation || undefined;
  }

  async updateGenerationStatus(id: number, status: string, epics?: any, completedAt?: Date): Promise<Generation | undefined> {
    const updateData: any = { status };
    if (epics !== undefined) updateData.epics = epics;
    if (completedAt !== undefined) updateData.completedAt = completedAt;

    const [updated] = await db
      .update(generations)
      .set(updateData)
      .where(eq(generations.id, id))
      .returning();
    
    return updated || undefined;
  }

  async getGenerationsByDocument(documentId: number): Promise<Generation[]> {
    return await db.select().from(generations).where(eq(generations.documentId, documentId));
  }
}

export const storage = new DatabaseStorage();
