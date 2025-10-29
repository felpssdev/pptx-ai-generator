/**
 * Color extraction and WCAG contrast validation utilities
 */

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ColorPixel {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): ColorPixel | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
}

/**
 * Calculate relative luminance (WCAG)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((x) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function getContrastRatio(
  color1: ColorPixel,
  color2: ColorPixel
): number {
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors have sufficient contrast (WCAG AA)
 * Requires 4.5:1 ratio for normal text
 */
export function hasSufficientContrast(
  color1: ColorPixel,
  color2: ColorPixel,
  ratio: number = 4.5
): boolean {
  return getContrastRatio(color1, color2) >= ratio;
}

/**
 * Calculate average color from array of pixels
 */
export function getAverageColor(colors: ColorPixel[]): ColorPixel {
  if (colors.length === 0) {
    return { r: 128, g: 128, b: 128 };
  }

  const sum = colors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: Math.round(sum.r / colors.length),
    g: Math.round(sum.g / colors.length),
    b: Math.round(sum.b / colors.length),
  };
}

/**
 * Get dominant colors from pixel data
 */
export function getDominantColors(
  data: Buffer,
  count: number = 8
): ColorPixel[] {
  const colorMap = new Map<string, number>();

  // Count color frequency
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Skip if alpha is too low
    if (data[i + 3] < 128) continue;

    // Reduce color depth for better clustering
    const key = `${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Get top colors
  const topColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map((x) => parseInt(x) * 16);
      return { r, g, b };
    });

  return topColors.length > 0
    ? topColors
    : [{ r: 66, g: 135, b: 245 }]; // Default blue
}

/**
 * Generate brand color palette from dominant colors
 */
export function generatePalette(dominantColors: ColorPixel[]): BrandColors {
  if (dominantColors.length === 0) {
    dominantColors = [{ r: 66, g: 135, b: 245 }];
  }

  // Use most dominant as primary
  const primary = dominantColors[0];

  // Find contrasting color for text
  let textColor = { r: 20, g: 20, b: 20 }; // Dark
  const textLuminance = getLuminance(textColor.r, textColor.g, textColor.b);
  const primaryLuminance = getLuminance(primary.r, primary.g, primary.b);

  if (primaryLuminance < 0.5) {
    // Dark primary, use light text
    textColor = { r: 245, g: 245, b: 245 }; // Light
  }

  // Find secondary (different from primary)
  let secondary = dominantColors[1] || { r: 155, g: 155, b: 155 };
  if (
    !hasSufficientContrast(primary, secondary, 3) &&
    dominantColors.length > 2
  ) {
    secondary = dominantColors[2];
  }

  // Generate accent (complementary)
  const accent = {
    r: 255 - primary.r,
    g: 255 - primary.g,
    b: 255 - primary.b,
  };

  // Background color (light variant of primary)
  const background = {
    r: Math.min(255, primary.r + 40),
    g: Math.min(255, primary.g + 40),
    b: Math.min(255, primary.b + 40),
  };

  return {
    primary: rgbToHex(primary.r, primary.g, primary.b),
    secondary: rgbToHex(secondary.r, secondary.g, secondary.b),
    accent: rgbToHex(accent.r, accent.g, accent.b),
    background: rgbToHex(background.r, background.g, background.b),
    text: rgbToHex(textColor.r, textColor.g, textColor.b),
  };
}
