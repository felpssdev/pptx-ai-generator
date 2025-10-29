import { Template } from './types';

export const minimalTemplate: Template = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Minimalist design focusing on content with whitespace',
  preview:
    'Clean and minimal design with generous whitespace, single color accents, and elegant typography. Best for academic or creative presentations.',
  colors: {
    background: '#fafafa',
    title: '#000000',
    text: '#555555',
    accent: '#666666',
  },
  fonts: {
    title: 'Georgia, serif',
    body: 'Lucida Grande, Trebuchet MS, sans-serif',
  },
  layout: 'minimal',
};
