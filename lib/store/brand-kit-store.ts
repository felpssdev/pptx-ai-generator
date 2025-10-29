import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { BrandColors } from '@/lib/utils/color-extraction';

export type TemplateType = 'professional' | 'modern' | 'minimal';

/**
 * Brand Kit Store State
 */
export interface BrandKitStoreState {
  logo: string | null;
  colors: BrandColors | null;
  selectedTemplate: TemplateType;
  isLoading: boolean;
  error: string | null;
}

/**
 * Brand Kit Store Actions
 */
export interface BrandKitStoreActions {
  uploadLogo: (file: File) => Promise<void>;
  setColors: (colors: BrandColors) => void;
  setTemplate: (template: TemplateType) => void;
  reset: () => void;
}

/**
 * Combined Store Type
 */
export type BrandKitStore = BrandKitStoreState & BrandKitStoreActions;

/**
 * Initial state
 */
const initialState: BrandKitStoreState = {
  logo: null,
  colors: null,
  selectedTemplate: 'professional',
  isLoading: false,
  error: null,
};

/**
 * Zustand store with persistence and devtools
 */
export const useBrandKitStore = create<BrandKitStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        ...initialState,

        // Actions
        uploadLogo: async (file: File) => {
          set({ isLoading: true, error: null }, false, 'uploadLogo');

          try {
            // Step 1: Upload logo
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/brand-kit/upload', {
              method: 'POST',
              body: formData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(
                errorData.error?.message || 'Failed to upload logo'
              );
            }

            const uploadData = await uploadResponse.json();
            if (!uploadData.success || !uploadData.logo) {
              throw new Error('Logo upload failed');
            }

            const logoBase64 = uploadData.logo;

            // Step 2: Extract colors from logo
            const extractResponse = await fetch(
              '/api/brand-kit/extract-colors',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logoBase64 }),
              }
            );

            if (!extractResponse.ok) {
              const errorData = await extractResponse.json();
              throw new Error(
                errorData.error?.message || 'Failed to extract colors'
              );
            }

            const extractData = await extractResponse.json();
            if (!extractData.success || !extractData.colors) {
              throw new Error('Color extraction failed');
            }

            // Update state
            set(
              {
                logo: logoBase64,
                colors: extractData.colors,
                isLoading: false,
              },
              false,
              'uploadLogo-success'
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error occurred';

            set(
              {
                isLoading: false,
                error: errorMessage,
              },
              false,
              'uploadLogo-error'
            );

            throw error;
          }
        },

        setColors: (colors: BrandColors) =>
          set({ colors }, false, 'setColors'),

        setTemplate: (template: TemplateType) =>
          set({ selectedTemplate: template }, false, 'setTemplate'),

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'brand-kit-store',
        version: 1,
      }
    ),
    { name: 'BrandKitStore' }
  )
);
