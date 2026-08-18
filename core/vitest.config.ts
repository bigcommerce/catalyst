import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Scoped to `lib/` on purpose: `tests/` holds Playwright specs, which
    // share the `*.spec.ts` suffix but must not be collected by Vitest.
    include: ['lib/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/.next/**'],
    // `turbo run test` invokes this in every package that defines a `test`
    // script, and Vitest treats an empty run as a failure by default. Nothing
    // under `lib/` has specs yet, so without this the harness would fail CI on
    // the very commit that introduces it.
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
