/**
 * Parse keywords from an image prompt
 * Extracts important nouns and adjectives for image search
 */
export function parsePromptToKeywords(prompt: string): string[] {
  // Remove common words and split
  const commonWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'about',
    'as',
    'this',
    'that',
    'these',
    'those',
  ]);

  const words = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => {
      // Remove punctuation
      const cleaned = word.replace(/[^\w-]/g, '');
      // Keep words that are not common and have some length
      return cleaned.length > 2 && !commonWords.has(cleaned);
    })
    .map((word) => word.replace(/[^\w-]/g, ''));

  // Get unique words and limit to 5 keywords
  return Array.from(new Set(words)).slice(0, 5);
}

/**
 * Unsplash API response type
 */
export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
  };
}

/**
 * Image generation response
 */
export interface ImageGenerationResponse {
  url: string | null;
  alt: string;
}

/**
 * Search Unsplash for images
 */
export async function searchUnsplashImages(
  keywords: string[],
  accessKey: string
): Promise<UnsplashImage | null> {
  if (!keywords.length) {
    return null;
  }

  const query = keywords.join(' ');

  try {
    const params = new URLSearchParams({
      query,
      orientation: 'landscape',
      per_page: '1',
      order_by: 'relevant',
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.statusText);
      return null;
    }

    const data = (await response.json()) as { results: UnsplashImage[] };

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0];
  } catch (error) {
    console.error('Failed to search Unsplash:', error);
    return null;
  }
}

/**
 * Generate image response from Unsplash image
 */
export function createImageResponse(
  image: UnsplashImage | null,
  prompt: string
): ImageGenerationResponse {
  if (!image) {
    return {
      url: null,
      alt: prompt,
    };
  }

  return {
    url: image.urls.regular,
    alt: image.alt_description || image.description || prompt,
  };
}
