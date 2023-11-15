import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  treeshake: false,
  splitting: false,
  entry: ['src/lib/utils.ts', 'src/components/*/index.{ts,tsx}'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react'],
  ...options,
}));
