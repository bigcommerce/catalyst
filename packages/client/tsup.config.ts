import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['cjs'],
  // tsup's declaration build sets baseUrl, which TypeScript 6 reports as deprecated.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: !options.watch,
  ...options,
}));
