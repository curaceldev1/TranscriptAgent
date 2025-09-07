import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ContentExtractor {
  static async extractFromUrl(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      const urlObj = new URL(url);
      
      // YouTube detection
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return await this.extractYouTubeTranscript(url);
      }
      
      // Web page extraction
      return await this.extractWebContent(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to extract content: ${errorMessage}`);
    }
  }

  private static async extractYouTubeTranscript(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      // Extract video ID from URL
      const videoId = this.extractYouTubeId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Use youtube-transcript-api (would need to install via npm)
      // For now, using yt-dlp as fallback which is more reliable
      const command = `yt-dlp --write-auto-sub --skip-download --sub-lang en --sub-format vtt -o "%(title)s" "${url}"`;
      
      try {
        const { stdout } = await execAsync(command);
        
        // Extract title and transcript
        const titleMatch = stdout.match(/^\[.*?\]\s+(.+?):/m);
        const title = titleMatch ? titleMatch[1] : 'YouTube Video';
        
        // Read the generated subtitle file
        const vttCommand = `find . -name "*.en.vtt" -exec cat {} \\; -exec rm {} \\;`;
        const { stdout: vttContent } = await execAsync(vttCommand);
        
        // Clean VTT content to plain text
        const content = this.cleanVTTContent(vttContent);
        
        return {
          title,
          content,
          type: 'youtube'
        };
      } catch (dlError) {
        // Fallback: try to use a simpler approach with youtube-dl
        throw new Error('YouTube transcript extraction failed. Please ensure yt-dlp is installed.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`YouTube extraction failed: ${errorMessage}`);
    }
  }

  private static extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  private static cleanVTTContent(vttContent: string): string {
    // Remove VTT headers and timestamps
    return vttContent
      .split('\n')
      .filter(line => 
        !line.startsWith('WEBVTT') && 
        !line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/) &&
        !line.includes('-->') &&
        line.trim() !== ''
      )
      .join(' ')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static async extractWebContent(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Web Page';

      // Basic content extraction (remove HTML tags and get text)
      const content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Take first 10000 characters to avoid too much content
      const trimmedContent = content.length > 10000 ? content.substring(0, 10000) + '...' : content;

      return {
        title,
        content: trimmedContent,
        type: 'webpage'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Web content extraction failed: ${errorMessage}`);
    }
  }
}
