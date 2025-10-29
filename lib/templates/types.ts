import { BrandColors } from '@/lib/utils/color-extraction';

export type LayoutType = 'standard' | 'sidebar' | 'minimal';

export interface TemplateColors {
  background: string;
  title: string;
  text: string;
  accent: string;
}

export interface TemplateFonts {
  title: string;
  body: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string; // visual description
  colors: TemplateColors;
  fonts: TemplateFonts;
  layout: LayoutType;
}

/**
 * Apply brand kit colors to a template
 */
export function applyBrandKit(
  template: Template,
  brandColors: BrandColors
): Template {
  return {
    ...template,
    colors: {
      background: brandColors.background,
      title: brandColors.primary,
      text: brandColors.text,
      accent: brandColors.accent,
    },
  };
}
