import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import type { Source } from "@shared/schema";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: sources = [] } = useQuery<Source[]>({
    queryKey: ["/api/sources"],
  });

  const readySourcesCount = sources.filter((s: Source) => s.status === "ready").length;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <ChatArea 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sourcesCount={readySourcesCount}
      />
    </div>
  );
}
