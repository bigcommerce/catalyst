export { RoutesMiddleware } from './middleware';
export { MemoryKVAdapter, KVWithMemoryFallback } from './kv';
export * from './types';
export * from './defaults';

import { RoutesMiddleware } from './middleware';
import { RoutesMiddlewareConfig } from './types';

// Convenience function for quick setup
export function createRoutesMiddleware(config: RoutesMiddlewareConfig) {
  const middleware = new RoutesMiddleware(config);
  return middleware.createMiddleware();
}