import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  clean: !options.watch,
  ...options,
}));
