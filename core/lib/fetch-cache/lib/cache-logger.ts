interface FetchCacheOperation {
  operation: 'FETCH' | 'BATCH_FETCH' | 'CACHE_SET';
  cacheKeys: string[];
  memoryHits?: number;
  backendHits?: number;
  totalMisses?: number;
  memoryTime?: number;
  backendTime?: number;
  totalTime: number;
  options?: Record<string, unknown>;
  backend?: string;
}

interface FetchCacheLoggerConfig {
  enabled: boolean;
  prefix?: string;
}

export class FetchCacheLogger {
  private config: FetchCacheLoggerConfig;

  constructor(config: FetchCacheLoggerConfig) {
    this.config = config;
  }

  logOperation(operation: FetchCacheOperation): void {
    if (!this.config.enabled) return;

    const prefix = this.config.prefix || '[Fetch Cache]';
    const { operation: op, cacheKeys, totalTime, backend } = operation;

    // Build the main message
    const keyStr = cacheKeys.length === 1 ? cacheKeys[0] : `[${cacheKeys.join(', ')}]`;
    let message = `${prefix} ${op} ${keyStr}`;

    // Add backend info if available
    if (backend) {
      message += ` (${backend})`;
    }

    // Add hit/miss analysis for fetch operations
    if (op === 'FETCH' || op === 'BATCH_FETCH') {
      const analysis = this.buildHitMissAnalysis(operation);
      if (analysis) {
        message += ` - ${analysis}`;
      }
    }

    // Add timing breakdown
    const timing = this.buildTimingBreakdown(operation);
    if (timing) {
      message += ` - ${timing}`;
    }

    // Add options if present (for CACHE_SET operations)
    if (operation.options && Object.keys(operation.options).length > 0) {
      const opts = this.formatOptions(operation.options);
      message += ` - ${opts}`;
    }

    // eslint-disable-next-line no-console
    console.log(message);
  }

  private buildHitMissAnalysis(operation: FetchCacheOperation): string {
    const { cacheKeys, memoryHits = 0, backendHits = 0, totalMisses = 0 } = operation;
    const total = cacheKeys.length;

    if (memoryHits === total) {
      return '✓ All from memory cache';
    }

    if (memoryHits + backendHits === total) {
      if (memoryHits > 0) {
        return `✓ Memory: ${memoryHits}, Backend: ${backendHits}`;
      }
      return `✓ All from backend cache`;
    }

    // Some misses - need to fetch fresh data
    const parts = [];
    if (memoryHits > 0) parts.push(`Memory: ${memoryHits}`);
    if (backendHits > 0) parts.push(`Backend: ${backendHits}`);
    if (totalMisses > 0) parts.push(`✗ Fetch required: ${totalMisses}`);

    return parts.join(', ');
  }

  private buildTimingBreakdown(operation: FetchCacheOperation): string {
    const { memoryTime, backendTime, totalTime } = operation;
    const parts = [];

    if (memoryTime !== undefined) {
      parts.push(`Memory: ${memoryTime.toFixed(2)}ms`);
    }

    if (backendTime !== undefined) {
      parts.push(`Backend: ${backendTime.toFixed(2)}ms`);
    }

    parts.push(`Total: ${totalTime.toFixed(2)}ms`);

    return parts.join(', ');
  }

  private formatOptions(options: Record<string, unknown>): string {
    const parts = [];

    if (options.ttl) {
      parts.push(`TTL: ${options.ttl}s`);
    }

    if (Array.isArray(options.tags) && options.tags.length > 0) {
      parts.push(`Tags: [${options.tags.join(', ')}]`);
    }

    // Add other relevant options
    Object.entries(options).forEach(([key, value]) => {
      if (key !== 'ttl' && key !== 'tags' && value !== undefined) {
        parts.push(`${key}: ${String(value)}`);
      }
    });

    return parts.length > 0 ? `Options: ${parts.join(', ')}` : '';
  }
}

// Performance timing utility with feature detection
export const getPerformanceTimer = (): (() => number) => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return () => performance.now();
  }
  return () => Date.now();
};

export const timer = getPerformanceTimer();
