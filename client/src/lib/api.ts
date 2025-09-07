import { apiRequest } from "./queryClient";
import type { Source, Message } from "@shared/schema";

export const api = {
  // Sources
  getSources: (): Promise<Source[]> =>
    fetch("/api/sources").then(res => res.json()),

  addSource: (url: string, title: string = "Untitled", type: string = "unknown") =>
    apiRequest("POST", "/api/sources", { url, title, type }),

  deleteSource: (id: string) =>
    apiRequest("DELETE", `/api/sources/${id}`),

  // Messages
  getMessages: (): Promise<Message[]> =>
    fetch("/api/messages").then(res => res.json()),

  sendMessage: (message: string) =>
    apiRequest("POST", "/api/chat", { message }),

  clearMessages: () =>
    apiRequest("DELETE", "/api/messages"),
};
