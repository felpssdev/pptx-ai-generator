'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Slide } from '@/lib/ai';
import {
  parseSSEEvent,
  SSEErrorEvent,
} from '@/lib/utils/sse-parser';

export interface UseStreamingGenerationState {
  slides: Slide[];
  isGenerating: boolean;
  error: Error | null;
  progress: number; // 0-100
}

export interface UseStreamingGeneration
  extends UseStreamingGenerationState {
  generate: (prompt: string, numSlides?: number) => Promise<void>;
  reset: () => void;
}

const DEFAULT_NUM_SLIDES = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useStreamingGeneration(): UseStreamingGeneration {
  const [state, setState] = useState<UseStreamingGenerationState>({
    slides: [],
    isGenerating: false,
    error: null,
    progress: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);

  /**
   * Close EventSource and cleanup
   */
  const closeEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  /**
   * Handle SSE events
   */
  const handleSSEEvent = useCallback((event: Event) => {
    const messageEvent = event as MessageEvent;
    const parsedEvent = parseSSEEvent(messageEvent.data);

    if (!parsedEvent) return;

    switch (parsedEvent.type) {
      case 'chunk': {
        // Update progress (rough estimate based on chunk count)
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 90),
        }));
        break;
      }

      case 'slide': {
        setState((prev) => ({
          ...prev,
          slides: [...prev.slides, parsedEvent.data],
          progress: Math.min(prev.progress + 10, 90),
        }));
        break;
      }

      case 'complete': {
        closeEventSource();
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          progress: 100,
        }));
        break;
      }

      case 'error': {
        const errorEvent = parsedEvent as SSEErrorEvent;
        closeEventSource();
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: new Error(
            `${errorEvent.data.code}: ${errorEvent.data.message}`
          ),
        }));
        break;
      }
    }
  }, [closeEventSource]);

  /**
   * Handle EventSource errors
   */
  const handleError = useCallback(
    (error: Event) => {
      closeEventSource();

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setState((prev) => ({
          ...prev,
          error: new Error(
            `Connection error. Retrying (${retryCountRef.current}/${MAX_RETRIES})...`
          ),
        }));

        // Retry after delay
        setTimeout(() => {
          // Retry logic would be triggered in generate()
        }, RETRY_DELAY);
      } else {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: new Error(
            'Connection failed. Please try again or contact support.'
          ),
        }));
      }
    },
    [closeEventSource]
  );

  /**
   * Generate presentation via streaming
   */
  const generate = useCallback(
    async (prompt: string, numSlides: number = DEFAULT_NUM_SLIDES) => {
      // Reset state
      setState({
        slides: [],
        isGenerating: true,
        error: null,
        progress: 0,
      });
      retryCountRef.current = 0;

      try {
        // Send request to API
        const response = await fetch('/api/presentations/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, numSlides }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || `HTTP ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error('No response body received');
        }

        // Setup EventSource for SSE
        closeEventSource();

        // Use fetch ReadableStream for SSE
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              progress: 100,
            }));
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              const event = parseSSEEvent(data);

              if (event) {
                handleSSEEvent(
                  new MessageEvent('message', { data })
                );
              }
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: new Error(errorMessage),
        }));
      }
    },
    [handleSSEEvent, closeEventSource]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    closeEventSource();
    setState({
      slides: [],
      isGenerating: false,
      error: null,
      progress: 0,
    });
    retryCountRef.current = 0;
  }, [closeEventSource]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      closeEventSource();
    };
  }, [closeEventSource]);

  return {
    slides: state.slides,
    isGenerating: state.isGenerating,
    error: state.error,
    progress: state.progress,
    generate,
    reset,
  };
}
