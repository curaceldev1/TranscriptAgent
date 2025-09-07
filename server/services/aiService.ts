import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatRequest {
  message: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
  }>;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  sourcesUsed: string[];
}

export class AIService {
  static async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Build context from sources
      const sourceContext = request.sources
        .map(source => `
Source: ${source.title} (${source.type})
Content: ${source.content.substring(0, 2000)}${source.content.length > 2000 ? '...' : ''}
---`)
        .join('\n');

      // Build conversation history
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are a helpful AI assistant that analyzes and answers questions about user-provided content sources. 

Available sources:
${sourceContext}

Instructions:
- Answer questions based on the provided sources
- If you reference specific sources, mention them by name
- If information isn't available in the sources, say so clearly
- Provide detailed, helpful responses with specific examples when possible
- Format responses clearly with bullet points or sections when appropriate
- Always be accurate and don't make assumptions beyond what's in the sources`
        }
      ];

      // Add conversation history
      if (request.conversationHistory) {
        messages.push(...request.conversationHistory);
      }

      // Add current user message
      messages.push({
        role: "user",
        content: request.message
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages,
        temperature: 0.7,
        max_completion_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

      // Determine which sources were likely used (simple heuristic)
      const sourcesUsed = request.sources
        .filter(source => 
          response.toLowerCase().includes(source.title.toLowerCase()) ||
          response.toLowerCase().includes(source.type.toLowerCase())
        )
        .map(source => source.id);

      return {
        response,
        sourcesUsed
      };
    } catch (error) {
      console.error('AI Service error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI chat failed: ${errorMessage}`);
    }
  }

  static async summarize(content: string, title: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates clear, concise summaries of content."
          },
          {
            role: "user",
            content: `Please create a comprehensive summary of this content titled "${title}":

${content}`
          }
        ],
        temperature: 0.5,
        max_completion_tokens: 500,
      });

      return completion.choices[0]?.message?.content || "Summary generation failed.";
    } catch (error) {
      console.error('Summarization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Summarization failed: ${errorMessage}`);
    }
  }
}
