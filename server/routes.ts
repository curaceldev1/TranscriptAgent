import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSourceSchema, insertMessageSchema } from "@shared/schema";
import { ContentExtractor } from "./services/contentExtractor";
import { AIService } from "./services/aiService";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all sources
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getAllSources();
      res.json(sources);
    } catch (error) {
      console.error('Get sources error:', error);
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });

  // Add a new source
  app.post("/api/sources", async (req, res) => {
    try {
      const validatedData = insertSourceSchema.parse(req.body);
      
      // Create source with processing status
      const source = await storage.createSource({
        ...validatedData,
        status: "processing"
      });

      // Start extraction in background
      ContentExtractor.extractFromUrl(validatedData.url)
        .then(async (extracted) => {
          await storage.updateSource(source.id, {
            title: extracted.title,
            content: extracted.content,
            type: extracted.type,
            status: "ready",
            extractedAt: new Date()
          });
        })
        .catch(async (error) => {
          console.error('Content extraction error:', error);
          await storage.updateSource(source.id, {
            status: "error",
            errorMessage: error.message
          });
        });

      res.status(201).json(source);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error('Add source error:', error);
        res.status(500).json({ message: "Failed to add source" });
      }
    }
  });

  // Delete a source
  app.delete("/api/sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSource(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Source not found" });
        return;
      }
      
      res.status(200).json({ message: "Source deleted successfully" });
    } catch (error) {
      console.error('Delete source error:', error);
      res.status(500).json({ message: "Failed to delete source" });
    }
  });

  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        res.status(400).json({ message: "Message is required" });
        return;
      }

      // Get all ready sources
      const allSources = await storage.getAllSources();
      const readySources = allSources.filter(s => s.status === "ready" && s.content);

      if (readySources.length === 0) {
        res.status(400).json({ message: "No content sources available. Please add and process some sources first." });
        return;
      }

      // Get conversation history
      const previousMessages = await storage.getAllMessages();
      const conversationHistory = previousMessages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Save user message
      await storage.createMessage({
        content: message,
        role: "user",
        sourceIds: []
      });

      // Get AI response
      const aiResponse = await AIService.chat({
        message,
        sources: readySources.map(s => ({
          id: s.id,
          title: s.title || 'Untitled',
          content: s.content || '',
          type: s.type
        })),
        conversationHistory
      });

      // Save AI response
      const assistantMessage = await storage.createMessage({
        content: aiResponse.response,
        role: "assistant",
        sourceIds: aiResponse.sourcesUsed
      });

      res.json({
        message: assistantMessage,
        sourcesUsed: aiResponse.sourcesUsed
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Chat failed: ${errorMessage}` });
    }
  });

  // Clear chat history
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error('Clear messages error:', error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
