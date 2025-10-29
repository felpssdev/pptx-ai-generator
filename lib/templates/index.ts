// Template types and utilities
export * from './types';

// Templates
export { professionalTemplate } from './professional';
export { modernTemplate } from './modern';
export { minimalTemplate } from './minimal';

// Template registry
import { professionalTemplate } from './professional';
import { modernTemplate } from './modern';
import { minimalTemplate } from './minimal';

export const TEMPLATES = [
  professionalTemplate,
  modernTemplate,
  minimalTemplate,
];

/**
 * Get template by ID
 */
export function getTemplateById(
  id: string
): (typeof TEMPLATES)[number] | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
