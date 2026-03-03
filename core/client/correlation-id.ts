import { cache } from 'react';

/**
 * Returns a stable correlation ID for the current request.
 * React.cache ensures the same UUID is returned for all fetches within a
 * single page render, while being unique across renders/requests.
 */
export const getCorrelationId = cache((): string => crypto.randomUUID());
