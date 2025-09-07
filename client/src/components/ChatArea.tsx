import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Settings, Fan, Send, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface ChatAreaProps {
  onToggleSidebar: () => void;
  sourcesCount: number;
}

export function ChatArea({ onToggleSidebar, sourcesCount }: ChatAreaProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => api.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setInputMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: () => api.clearMessages(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Chat cleared",
        description: "All messages have been removed.",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessageMutation.isPending]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputMessage.trim();
    
    if (!message) return;
    
    if (sourcesCount === 0) {
      toast({
        title: "No sources available",
        description: "Please add some data sources before starting a conversation.",
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex items-start space-x-4 ${isUser ? 'justify-end' : ''} animate-in slide-in-from-bottom-2 duration-300`}
        data-testid={`message-${message.role}-${message.id}`}
      >
        {!isUser && (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        
        <div className={`flex-1 ${isUser ? 'max-w-2xl' : ''}`}>
          <div
            className={`rounded-lg p-4 ${
              isUser
                ? 'bg-primary text-primary-foreground ml-12 rounded-tr-none'
                : 'bg-muted text-card-foreground rounded-tl-none'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className={`text-xs text-muted-foreground mt-2 ${isUser ? 'text-right' : ''}`}>
            {isUser ? 'You' : 'AI Assistant'} • {formatTime(message.createdAt)}
          </div>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-chart-4 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
            data-testid="button-toggle-sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">Chat with your content</h1>
            <p className="text-sm text-muted-foreground">Ask questions about your added data sources</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearChatMutation.mutate()}
            disabled={clearChatMutation.isPending || messages.length === 0}
            data-testid="button-clear-chat"
          >
            <Fan className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="chat-messages">
        {messages.length === 0 ? (
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg rounded-tl-none p-4">
                <p className="text-card-foreground text-sm leading-relaxed">
                  Hello! I'm your AI assistant. I can help you analyze and extract insights from your uploaded content sources.
                  <br /><br />
                  {sourcesCount > 0 ? (
                    <>
                      You currently have <strong>{sourcesCount} data source{sourcesCount > 1 ? 's' : ''}</strong> ready. Try asking me questions like:
                      <br />
                      • "Summarize the main points from the content"
                      <br />
                      • "What are the key takeaways?"
                      <br />
                      • "Compare insights from all sources"
                    </>
                  ) : (
                    <>
                      Please add some data sources first using the sidebar, then I'll be able to help you analyze them!
                    </>
                  )}
                </p>
              </div>
              <div className="text-xs text-muted-foreground mt-2">AI Assistant • Just now</div>
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {/* Typing Indicator */}
        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg rounded-tl-none p-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-border p-6">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your content sources..."
                className="resize-none min-h-[50px] max-h-32 pr-12"
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                disabled={sendMessageMutation.isPending || !inputMessage.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{sourcesCount} source{sourcesCount !== 1 ? 's' : ''} available</span>
              <div className={`w-2 h-2 rounded-full ${sourcesCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
