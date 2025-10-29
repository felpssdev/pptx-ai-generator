'use client';

import { useState, useCallback } from 'react';
import {
  geminiClient,
  PresentationResponse,
  GenerationError,
  InvalidAPIKeyError,
} from '@/lib/ai';
import {
  buildPresentationPrompt,
  validatePresentationResponse,
} from '@/lib/ai/gemini/prompts';

interface UseGeminiGenerationState {
  isLoading: boolean;
  error: string | null;
  data: PresentationResponse | null;
  streamText: string;
}

export function useGeminiGeneration() {
  const [state, setState] = useState<UseGeminiGenerationState>({
    isLoading: false,
    error: null,
    data: null,
    streamText: '',
  });

  const generatePresentation = useCallback(
    async (prompt: string, numSlides: number) => {
      setState({ isLoading: true, error: null, data: null, streamText: '' });

      try {
        const fullPrompt = buildPresentationPrompt(prompt, numSlides);
        const response = await geminiClient.generateContent(fullPrompt);

        // Parse JSON response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new GenerationError('No JSON found in response');
        }

        const jsonText = jsonMatch[0];
        const parsedData = JSON.parse(jsonText);
        const validatedData = validatePresentationResponse(parsedData);

        // Validate slide count
        if (validatedData.slides.length !== numSlides) {
          throw new GenerationError(
            `Expected ${numSlides} slides, got ${validatedData.slides.length}`
          );
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          data: validatedData,
        }));

        return validatedData;
      } catch (error) {
        const errorMessage =
          error instanceof InvalidAPIKeyError
            ? 'API key not configured. Please check .env.local'
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    []
  );

  const streamPresentation = useCallback(
    async (prompt: string, numSlides: number) => {
      setState({ isLoading: true, error: null, data: null, streamText: '' });

      try {
        const fullPrompt = buildPresentationPrompt(prompt, numSlides);
        let fullText = '';

        for await (const chunk of geminiClient.streamGenerateContent(
          fullPrompt
        )) {
          fullText += chunk.text;
          setState((prev) => ({
            ...prev,
            streamText: fullText,
          }));
        }

        // Parse accumulated response
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new GenerationError('No JSON found in streamed response');
        }

        const jsonText = jsonMatch[0];
        const parsedData = JSON.parse(jsonText);
        const validatedData = validatePresentationResponse(parsedData);

        // Validate slide count
        if (validatedData.slides.length !== numSlides) {
          throw new GenerationError(
            `Expected ${numSlides} slides, got ${validatedData.slides.length}`
          );
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          data: validatedData,
          streamText: fullText,
        }));

        return validatedData;
      } catch (error) {
        const errorMessage =
          error instanceof InvalidAPIKeyError
            ? 'API key not configured. Please check .env.local'
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null, streamText: '' });
  }, []);

  return {
    ...state,
    generatePresentation,
    streamPresentation,
    reset,
  };
}
