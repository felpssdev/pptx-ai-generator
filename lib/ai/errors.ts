export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class QuotaExceededError extends AIError {
  constructor(message: string = 'API quota exceeded') {
    super(message, 'QUOTA_EXCEEDED', 429);
    this.name = 'QuotaExceededError';
  }
}

export class InvalidAPIKeyError extends AIError {
  constructor(message: string = 'Invalid or missing API key') {
    super(message, 'INVALID_API_KEY', 401);
    this.name = 'InvalidAPIKeyError';
  }
}

export class RateLimitError extends AIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class ContentFilterError extends AIError {
  constructor(
    message: string = 'Content was filtered by safety filters'
  ) {
    super(message, 'CONTENT_FILTER', 400);
    this.name = 'ContentFilterError';
  }
}

export class GenerationError extends AIError {
  constructor(message: string = 'Error generating content') {
    super(message, 'GENERATION_ERROR', 500);
    this.name = 'GenerationError';
  }
}

export function handleGeminiError(error: unknown): never {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('api key') || message.includes('unauthorized')) {
      throw new InvalidAPIKeyError(error.message);
    }

    if (message.includes('quota') || message.includes('429')) {
      throw new QuotaExceededError(error.message);
    }

    if (message.includes('rate limit')) {
      throw new RateLimitError(error.message);
    }

    if (
      message.includes('filter') ||
      message.includes('blocked') ||
      message.includes('safety')
    ) {
      throw new ContentFilterError(error.message);
    }

    throw new GenerationError(error.message);
  }

  throw new GenerationError('Unknown error occurred');
}
