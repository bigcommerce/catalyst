let counter = 0;

/**
 * Returns a correlation ID for tracing requests.
 * Uses a simple counter to avoid crypto.randomUUID() and Date.now() which
 * trigger Next.js cacheComponents prerender errors for accessing dynamic
 * values before uncached data.
 *
 * @returns {string} A unique correlation ID string.
 */
export function getCorrelationId(): string {
  // eslint-disable-next-line no-plusplus
  return `req-${(counter++).toString(36)}`;
}
