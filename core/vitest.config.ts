import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Scoped to `lib/` and `proxies/` on purpose: `tests/` holds Playwright specs, which
    // share the `*.spec.ts` suffix but must not be collected by Vitest.
    include: ['lib/**/*.spec.ts', 'proxies/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
