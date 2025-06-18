interface CacheOperation {
  operation: 'GET' | 'MGET' | 'SET';
  keys: string[];
  memoryHits?: number;
  backendHits?: number;
  totalMisses?: number;
  memoryTime?: number;
  backendTime?: number;
  totalTime: number;
  options?: Record<string, unknown>;
  backend?: string;
}

interface CacheLoggerConfig {
  enabled: boolean;
  prefix?: string;
}

export class CacheLogger {
  private config: CacheLoggerConfig;

  constructor(config: CacheLoggerConfig) {
    this.config = config;
  }

  logOperation(operation: CacheOperation): void {
    if (!this.config.enabled) return;

    const prefix = this.config.prefix || '[Cache]';
    const { operation: op, keys, totalTime, backend } = operation;

    // Build the main message
    const keyStr = keys.length === 1 ? keys[0] : `[${keys.join(', ')}]`;
    let message = `${prefix} ${op} ${keyStr}`;

    // Add backend info if available
    if (backend) {
      message += ` (${backend})`;
    }

    // Add hit/miss analysis for GET/MGET operations
    if (op === 'GET' || op === 'MGET') {
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

    // Add options if present (for SET operations)
    if (operation.options && Object.keys(operation.options).length > 0) {
      const opts = this.formatOptions(operation.options);
      message += ` - ${opts}`;
    }

    // eslint-disable-next-line no-console
    console.log(message);
  }

  private buildHitMissAnalysis(operation: CacheOperation): string {
    const { keys, memoryHits = 0, backendHits = 0, totalMisses = 0 } = operation;
    const total = keys.length;

    if (memoryHits === total) {
      return '✓ All from memory';
    }

    if (memoryHits + backendHits === total) {
      if (memoryHits > 0) {
        return `✓ Memory: ${memoryHits}, Backend: ${backendHits}`;
      }
      return `✓ All from backend`;
    }

    // Some misses
    const parts = [];
    if (memoryHits > 0) parts.push(`Memory: ${memoryHits}`);
    if (backendHits > 0) parts.push(`Backend: ${backendHits}`);
    if (totalMisses > 0) parts.push(`✗ Misses: ${totalMisses}`);

    return parts.join(', ');
  }

  private buildTimingBreakdown(operation: CacheOperation): string {
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