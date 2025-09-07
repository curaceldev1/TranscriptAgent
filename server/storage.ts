import { type Source, type InsertSource, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Sources
  createSource(source: InsertSource): Promise<Source>;
  getSource(id: string): Promise<Source | undefined>;
  getAllSources(): Promise<Source[]>;
  updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined>;
  deleteSource(id: string): Promise<boolean>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  clearMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private sources: Map<string, Source>;
  private messages: Map<string, Message>;

  constructor() {
    this.sources = new Map();
    this.messages = new Map();
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const id = randomUUID();
    const source: Source = {
      ...insertSource,
      id,
      createdAt: new Date(),
      extractedAt: null,
      content: insertSource.content || null,
      errorMessage: insertSource.errorMessage || null,
      status: insertSource.status || "processing",
    };
    this.sources.set(id, source);
    return source;
  }

  async getSource(id: string): Promise<Source | undefined> {
    return this.sources.get(id);
  }

  async getAllSources(): Promise<Source[]> {
    return Array.from(this.sources.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined> {
    const source = this.sources.get(id);
    if (!source) return undefined;

    const updatedSource = { ...source, ...updates };
    this.sources.set(id, updatedSource);
    return updatedSource;
  }

  async deleteSource(id: string): Promise<boolean> {
    return this.sources.delete(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      sourceIds: insertMessage.sourceIds || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
    );
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
  }
}

export const storage = new MemStorage();
