import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIResponse,
  AIStreamChunk,
  GenerationConfig,
  DEFAULT_GENERATION_CONFIG,
} from '../types';
import {
  handleGeminiError,
  InvalidAPIKeyError,
} from '../errors';

const MODEL_NAME = 'gemini-2.5-pro';

class GeminiClient {
  private static instance: GeminiClient;
  private client: GoogleGenerativeAI | null = null;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
    null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  private initialize(): void {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new InvalidAPIKeyError(
        'GEMINI_API_KEY environment variable is not set'
      );
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({
      model: MODEL_NAME,
    });
  }

  /**
   * Generate content from a prompt (single request)
   */
  async generateContent(
    prompt: string,
    config?: GenerationConfig
  ): Promise<AIResponse> {
    if (!this.model) {
      throw new InvalidAPIKeyError('Gemini client not initialized');
    }

    try {
      const generationConfig = {
        ...DEFAULT_GENERATION_CONFIG,
        ...config,
      };

      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      return {
        text,
        finishReason: response.candidates?.[0]?.finishReason,
        usage: response.usageMetadata
          ? {
              promptTokens: response.usageMetadata.promptTokenCount,
              completionTokens: response.usageMetadata.candidatesTokenCount,
              totalTokens:
                response.usageMetadata.promptTokenCount +
                response.usageMetadata.candidatesTokenCount,
            }
          : undefined,
      };
    } catch (error) {
      handleGeminiError(error);
    }
  }

  /**
   * Stream content generation from a prompt
   */
  async *streamGenerateContent(
    prompt: string,
    config?: GenerationConfig
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    if (!this.model) {
      throw new InvalidAPIKeyError('Gemini client not initialized');
    }

    try {
      const generationConfig = {
        ...DEFAULT_GENERATION_CONFIG,
        ...config,
      };

      const stream = await this.model.generateContentStream({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig,
      });

      for await (const chunk of stream.stream) {
        const text = chunk.text?.() || '';
        if (text) {
          yield {
            text,
            delta: text,
          };
        }
      }
    } catch (error) {
      handleGeminiError(error);
    }
  }

  /**
   * Check if client is properly initialized
   */
  isInitialized(): boolean {
    return this.client !== null && this.model !== null;
  }
}

export const geminiClient = GeminiClient.getInstance();
