import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // NO setupFiles — deliberately excludes vitest.setup.ts (which starts MSW)
    include: ['e2e/**/*.e2e.spec.ts'],
    testTimeout: 900_000, // 15 minutes per test
    hookTimeout: 120_000, // 2 minutes for hooks
    // NO coverage thresholds
  },
});
