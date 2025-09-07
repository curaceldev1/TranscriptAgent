import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Source } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceItem } from "./SourceItem";
import { Brain, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const { data: sources = [], isLoading } = useQuery<Source[]>({
    queryKey: ["/api/sources"],
    refetchInterval: 2000, // Refresh every 2 seconds to check processing status
  });

  const addSourceMutation = useMutation({
    mutationFn: (url: string) => api.addSource(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      setUrlInput("");
      toast({
        title: "Source added",
        description: "Content extraction started. This may take a few moments.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add source",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (id: string) => api.deleteSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      toast({
        title: "Source deleted",
        description: "The data source has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete source",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    
    if (!url) return;
    
    try {
      new URL(url); // Validate URL format
      addSourceMutation.mutate(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = (id: string) => {
    deleteSourceMutation.mutate(id);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          data-testid="mobile-overlay"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          w-80 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out
          md:relative absolute inset-y-0 left-0 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-card-foreground">ContentChat</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
              data-testid="button-close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">AI-powered content analysis</p>
        </div>

        {/* Add Data Source Section */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-medium text-card-foreground mb-4">Add Data Source</h2>
          <form onSubmit={handleAddSource} className="space-y-4">
            <div>
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter YouTube URL, webpage, or document link..."
                className="w-full"
                disabled={addSourceMutation.isPending}
                data-testid="input-source-url"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={addSourceMutation.isPending || !urlInput.trim()}
              data-testid="button-add-source"
            >
              {addSourceMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Data Sources List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-card-foreground">Data Sources</h2>
            <span 
              className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
              data-testid="text-sources-count"
            >
              {sources.length}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                  <div className="h-3 bg-muted-foreground/20 rounded mb-1" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map((source: Source) => (
                <SourceItem
                  key={source.id}
                  source={source}
                  onDelete={handleDeleteSource}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8" data-testid="empty-sources-state">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">No data sources yet</p>
              <p className="text-xs text-muted-foreground">Add a YouTube link, webpage, or document to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
