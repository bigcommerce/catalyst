import { Command, Option } from 'commander';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';

export const start = new Command('start')
  .description('Start your Catalyst storefront in optimized production mode.')
  .allowUnknownOption(true)
  // The unknown options end up in program.args, not in program.opts(). Commander does not take a guess at how to interpret the unknown options.
  .argument(
    '[start-options...]',
    'Pass additional options to the start command. If framework is Next.js, see https://nextjs.org/docs/api-reference/cli#start for available options.',
  )
  .addOption(
    new Option('--framework <framework>', 'The framework to use for the preview').choices([
      'catalyst',
      'nextjs',
    ]),
  )
  .action(async (startOptions, options) => {
    try {
      const config = getProjectConfig();
      const framework = options.framework ?? config.get('framework');

      if (framework === 'nextjs') {
        const nextBin = join('node_modules', '.bin', 'next');

        if (!existsSync(nextBin)) {
          throw new Error(
            `Next.js is not installed in ${process.cwd()}. Are you in a valid Next.js project?`,
          );
        }

        await execa(nextBin, ['start', ...startOptions], {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
      }

      await execa(
        'pnpm',
        [
          'exec',
          'opennextjs-cloudflare',
          'preview',
          '--config',
          join('.bigcommerce', 'wrangler.jsonc'),
          ...startOptions,
        ],
        {
          stdio: 'inherit',
          cwd: process.cwd(),
        },
      );
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
    }
  });
