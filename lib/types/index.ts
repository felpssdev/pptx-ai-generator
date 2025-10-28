// Presentation types
export interface Slide {
  id: string;
  title: string;
  content: string;
  speakerNotes: string;
  imageUrl?: string;
  layout: 'title' | 'content' | 'two-column' | 'image';
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  slides: Slide[];
  theme: ThemeConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Theme & Brand Kit
export interface BrandKit {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
}

export interface ThemeConfig {
  brandKit: BrandKit;
  layout: 'default' | 'minimal' | 'modern';
}

// Generation state
export interface GenerationState {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  error?: string;
}
