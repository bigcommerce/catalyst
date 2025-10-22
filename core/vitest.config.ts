import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    env: loadEnv(mode, process.cwd(), ''),
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
    setupFiles: ['./vitest.setup.ts'],
  },
}));
