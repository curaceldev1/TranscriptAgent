import { Source } from "@shared/schema";
import { Trash2, Youtube, Globe, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SourceItemProps {
  source: Source;
  onDelete: (id: string) => void;
}

export function SourceItem({ source, onDelete }: SourceItemProps) {
  const getIcon = () => {
    switch (source.type) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-500" />;
      case "webpage":
        return <Globe className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (source.status) {
      case "ready":
        return (
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
            Ready
          </span>
        );
      case "processing":
        return (
          <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case "error":
        return (
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="bg-muted rounded-lg p-4 group hover:bg-accent transition-colors" data-testid={`source-item-${source.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getIcon()}
            <span className="text-xs text-muted-foreground capitalize">
              {source.type}
            </span>
            {getStatusBadge()}
          </div>
          <h3 className="text-sm font-medium text-card-foreground truncate mb-1">
            {source.title || 'Untitled Source'}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {source.url}
          </p>
          {source.status === "error" && source.errorMessage && (
            <p className="text-xs text-red-500 mt-1 truncate">
              Error: {source.errorMessage}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
            <span>
              {source.status === "ready" && source.content 
                ? `${Math.ceil(source.content.length / 1000)}k characters`
                : source.status === "processing" 
                ? "Extracting content..."
                : "No content"
              }
            </span>
            {source.createdAt && (
              <>
                <span>•</span>
                <span>{formatTimeAgo(source.createdAt)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(source.id)}
            className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            data-testid={`button-delete-source-${source.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
