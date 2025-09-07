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

      // First, try to get video info and title
      const infoCommand = `yt-dlp --print "%(title)s" "${url}"`;
      let title = 'YouTube Video';
      
      try {
        const { stdout: titleOutput } = await execAsync(infoCommand);
        title = titleOutput.trim() || 'YouTube Video';
      } catch (titleError) {
        console.warn('Failed to get video title, using default');
      }

      // Try to get subtitles with a simpler approach
      const subsCommand = `yt-dlp --write-subs --sub-lang en --skip-download --sub-format vtt --output "/tmp/yt_%(id)s.%(ext)s" "${url}"`;
      
      try {
        await execAsync(subsCommand);
        
        // Try to read the subtitle file
        const vttFiles = await execAsync(`find /tmp -name "yt_${videoId}.en.vtt" -type f`);
        
        if (vttFiles.stdout.trim()) {
          const vttFile = vttFiles.stdout.trim();
          const { stdout: vttContent } = await execAsync(`cat "${vttFile}"`);
          
          // Clean up the file
          await execAsync(`rm -f "${vttFile}"`);
          
          // Clean VTT content to plain text
          const content = this.cleanVTTContent(vttContent);
          
          if (content.length > 50) { // Only accept if we got substantial content
            return {
              title,
              content,
              type: 'youtube'
            };
          }
        }
      } catch (subsError) {
        console.warn('Subtitle extraction failed:', subsError);
      }

      // Fallback: extract description if no subtitles available
      try {
        const descCommand = `yt-dlp --print "%(description)s" "${url}"`;
        const { stdout: description } = await execAsync(descCommand);
        
        if (description && description.trim().length > 50) {
          return {
            title,
            content: description.trim().substring(0, 5000), // Limit description length
            type: 'youtube'
          };
        }
      } catch (descError) {
        console.warn('Description extraction failed:', descError);
      }

      // If everything fails, return basic info
      throw new Error('No transcript or description available for this video. Some videos may not have subtitles or accessible content.');
      
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
