import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: {
    cli: 'src/cli/index.ts',
    auth: 'src/auth/index.ts',
  },
  format: ['esm'],
  clean: !options.watch,
  dts: true,
  sourcemap: true,
  env: {
    CLI_SEGMENT_WRITE_KEY: process.env.CLI_SEGMENT_WRITE_KEY ?? 'not-a-valid-segment-write-key',
    CONSOLA_LEVEL: process.env.NODE_ENV === 'production' ? '2' : '3',
  },
  ...options,
}));
