import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  // Match the `node >= 24` engine so esbuild preserves `import.meta.url`
  // (a lower target shims it to `{}`, breaking `createRequire`).
  target: 'node24',
  clean: !options.watch,
  sourcemap: true,
  ...options,
}));
