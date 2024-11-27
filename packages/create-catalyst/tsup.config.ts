import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: !options.watch,
  sourcemap: true,
  env: {
    CLI_SEGMENT_WRITE_KEY: process.env.CLI_SEGMENT_WRITE_KEY ?? 'not-a-valid-segment-write-key',
  },
  ...options,
}));
