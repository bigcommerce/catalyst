import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: !options.watch,
  ...options,
}));
