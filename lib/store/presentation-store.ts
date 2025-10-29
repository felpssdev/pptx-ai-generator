import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Slide, PresentationResponse } from '@/lib/ai';

/**
 * Presentation data model for storage
 */
export interface StoredPresentation {
  id: string;
  title: string;
  subtitle: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Zustand store state interface
 */
export interface PresentationStoreState {
  presentation: StoredPresentation | null;
  isGenerating: boolean;
}

/**
 * Zustand store actions interface
 */
export interface PresentationStoreActions {
  // Setters
  setPresentation: (presentation: StoredPresentation) => void;
  setGenerating: (value: boolean) => void;

  // Slide operations
  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (slides: Slide[]) => void;

  // Presentation operations
  updatePresentationMetadata: (
    updates: Pick<StoredPresentation, 'title' | 'subtitle'>
  ) => void;

  // Reset
  reset: () => void;
}

/**
 * Combined store type
 */
export type PresentationStore = PresentationStoreState &
  PresentationStoreActions;

/**
 * Initial state
 */
const initialState: PresentationStoreState = {
  presentation: null,
  isGenerating: false,
};

/**
 * Zustand store with persistence and devtools
 */
export const usePresentationStore = create<PresentationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // Setters
        setPresentation: (presentation: StoredPresentation) =>
          set({ presentation }, false, 'setPresentation'),

        setGenerating: (value: boolean) =>
          set({ isGenerating: value }, false, 'setGenerating'),

        // Slide operations
        addSlide: (slide: Slide) =>
          set(
            (state) => {
              if (!state.presentation) {
                console.warn('Cannot add slide: no presentation loaded');
                return state;
              }

              return {
                presentation: {
                  ...state.presentation,
                  slides: [...state.presentation.slides, slide],
                  updatedAt: new Date().toISOString(),
                },
              };
            },
            false,
            'addSlide'
          ),

        updateSlide: (id: string, updates: Partial<Slide>) =>
          set(
            (state) => {
              if (!state.presentation) {
                console.warn('Cannot update slide: no presentation loaded');
                return state;
              }

              return {
                presentation: {
                  ...state.presentation,
                  slides: state.presentation.slides.map((slide) =>
                    slide.id === id ? { ...slide, ...updates } : slide
                  ),
                  updatedAt: new Date().toISOString(),
                },
              };
            },
            false,
            'updateSlide'
          ),

        removeSlide: (id: string) =>
          set(
            (state) => {
              if (!state.presentation) {
                console.warn('Cannot remove slide: no presentation loaded');
                return state;
              }

              return {
                presentation: {
                  ...state.presentation,
                  slides: state.presentation.slides.filter(
                    (slide) => slide.id !== id
                  ),
                  updatedAt: new Date().toISOString(),
                },
              };
            },
            false,
            'removeSlide'
          ),

        reorderSlides: (slides: Slide[]) =>
          set(
            (state) => {
              if (!state.presentation) {
                console.warn('Cannot reorder slides: no presentation loaded');
                return state;
              }

              return {
                presentation: {
                  ...state.presentation,
                  slides,
                  updatedAt: new Date().toISOString(),
                },
              };
            },
            false,
            'reorderSlides'
          ),

        // Presentation operations
        updatePresentationMetadata: (
          updates: Pick<StoredPresentation, 'title' | 'subtitle'>
        ) =>
          set(
            (state) => {
              if (!state.presentation) {
                console.warn('Cannot update metadata: no presentation loaded');
                return state;
              }

              return {
                presentation: {
                  ...state.presentation,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                },
              };
            },
            false,
            'updatePresentationMetadata'
          ),

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'presentation-store',
        version: 1,
      }
    ),
    { name: 'PresentationStore' }
  )
);

/**
 * Helper to create new presentation from response
 */
export function createPresentationFromResponse(
  response: PresentationResponse
): StoredPresentation {
  return {
    id: `presentation-${Date.now()}`,
    title: response.title,
    subtitle: response.subtitle,
    slides: response.slides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
