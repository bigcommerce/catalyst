import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  treeshake: false,
  splitting: false,
  entry: ['src/utils/*.{ts,tsx}', 'src/components/*/index.{ts,tsx}'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: !options.watch,
  external: ['react'],
  ...options,
}));
