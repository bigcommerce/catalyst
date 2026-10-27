import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Not `tests/`: those are Playwright specs.
    include: ['lib/**/*.spec.ts', 'proxies/**/*.spec.ts', 'client/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/.next/**'],
  },
  ssr: {
    resolve: {
      // `@makeswift/runtime/next/server` only declares `module` and `require` exports.
      conditions: ['module', 'node'],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
