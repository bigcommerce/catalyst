import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/cli/index.ts'],
      thresholds: {
        100: true,
      },
    },
  },
});
