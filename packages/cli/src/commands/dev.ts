import { Command } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const dev = new Command('dev')
  .description('Start the Catalyst development server.')
  // Proxy `--help` to the underlying `next dev` command
  .helpOption(false)
  .allowUnknownOption(true)
  // The unknown options end up in program.args, not in program.opts(). Commander does not take a guess at how to interpret the unknown options.
  .argument(
    '[options...]',
    'Next.js `dev` options (see: https://nextjs.org/docs/app/api-reference/cli/next#next-dev-options)',
  )
  .action(async (options) => {
    try {
      const nextBin = join('node_modules', '.bin', 'next');

      if (!existsSync(nextBin)) {
        throw new Error(
          `Next.js is not installed in ${process.cwd()}. Are you in a valid Next.js project?`,
        );
      }

      await execa(nextBin, ['dev', ...options], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
