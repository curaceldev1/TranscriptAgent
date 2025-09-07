import { YoutubeTranscript } from "youtube-transcript";
import pdfParse from "pdf-parse";

export class ContentExtractor {
  static async extractFromUrl(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      const urlObj = new URL(url);

      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        return await this.extractYouTubeTranscript(url);
      }

      if (urlObj.pathname.toLowerCase().endsWith(".pdf")) {
        return await this.extractPdfContent(url);
      }

      return await this.extractWebContent(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to extract content: ${errorMessage}`);
    }
  }

  private static async extractYouTubeTranscript(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      const videoId = this.extractYouTubeId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      let title = "YouTube Video";
      let pageHtml: string | null = null;
      try {
        const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        pageHtml = await res.text();
        const titleMatch = pageHtml.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].replace(" - YouTube", "").trim();
        }
      } catch (pageError) {
        console.warn("Failed to fetch video page", pageError);
      }

      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const content = transcript.map(t => t.text).join(" ");
        if (content.trim().length > 50) {
          return { title, content, type: "youtube" };
        }
      } catch (transcriptError) {
        console.warn("Transcript fetch failed:", transcriptError);
      }

      if (pageHtml) {
        const descMatch = pageHtml.match(/"shortDescription":"([^"]*)"/);
        if (descMatch) {
          const description = descMatch[1].replace(/\n/g, " ");
          if (description.trim().length > 50) {
            return { title, content: description.trim().substring(0, 5000), type: "youtube" };
          }
        }
      }

      throw new Error("No transcript or description available for this video. Some videos may not have subtitles or accessible content.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`YouTube extraction failed: ${errorMessage}`);
    }
  }

  private static extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  private static async extractPdfContent(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      const data = await pdfParse(Buffer.from(arrayBuffer));
      const title = (data.info && (data.info as any).Title) || url.split("/").pop() || "PDF Document";
      const content = data.text.trim();
      return { title, content, type: "pdf" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`PDF extraction failed: ${errorMessage}`);
    }
  }

  private static async extractWebContent(url: string): Promise<{
    title: string;
    content: string;
    type: string;
  }> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "Web Page";

      const content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const trimmedContent = content.length > 10000 ? content.substring(0, 10000) + "..." : content;

      return { title, content: trimmedContent, type: "webpage" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Web content extraction failed: ${errorMessage}`);
    }
  }
}

