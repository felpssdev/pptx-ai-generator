/**
 * Incremental JSON parser for streaming responses
 * Attempts to extract and parse complete objects as they arrive
 */
export class IncrementalJsonParser {
  private buffer = '';
  private depth = 0;
  private inString = false;
  private escapeNext = false;

  /**
   * Feed new chunk and attempt to parse complete objects
   */
  feed(chunk: string): unknown[] {
    this.buffer += chunk;
    const results: unknown[] = [];

    while (this.buffer.length > 0) {
      const parsed = this.tryParse();
      if (parsed.success) {
        results.push(parsed.value);
        this.buffer = this.buffer.slice(parsed.consumed);
      } else {
        break;
      }
    }

    return results;
  }

  /**
   * Try to parse a complete object from buffer
   */
  private tryParse(): { success: boolean; value?: unknown; consumed?: number } {
    this.buffer = this.buffer.trimLeft();

    if (this.buffer.length === 0) {
      return { success: false };
    }

    // Only handle objects and arrays
    if (this.buffer[0] !== '{' && this.buffer[0] !== '[') {
      return { success: false };
    }

    let braceDepth = 0;
    let inString = false;
    let escapeNext = false;
    let consumed = 0;

    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{' || char === '[') {
        braceDepth++;
      } else if (char === '}' || char === ']') {
        braceDepth--;

        if (braceDepth === 0) {
          consumed = i + 1;
          const jsonStr = this.buffer.slice(0, consumed);

          try {
            const value = JSON.parse(jsonStr);
            return { success: true, value, consumed };
          } catch {
            // Not valid JSON yet
            return { success: false };
          }
        }
      }
    }

    return { success: false };
  }

  /**
   * Get remaining unparsed buffer
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Clear parser state
   */
  reset(): void {
    this.buffer = '';
  }
}
