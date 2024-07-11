import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: !options.watch,
  sourcemap: true,
  // @todo tmp solution for "Error: Dynamic require of 'fs' is not supported"
  external: ['simple-git'],
  ...options,
}));
