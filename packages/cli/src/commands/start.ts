import { Command, Option } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getProjectConfig } from '../lib/project-config';

export const start = new Command('start')
  .description('Start your Catalyst storefront in optimized production mode.')
  // Proxy `--help` to the underlying `next start` command
  .helpOption(false)
  .allowUnknownOption(true)
  .argument(
    '[buildOptions...]',
    'Next.js `start` options (see: https://nextjs.org/docs/app/api-reference/cli/next#next-start-options)',
  )
  .addOption(
    new Option('--framework <framework>', 'The framework to use for the preview').choices([
      'catalyst',
      'nextjs',
    ]),
  )
  .action(async (buildOptions, options) => {
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

        await execa(nextBin, ['start', ...buildOptions], {
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
          ...buildOptions,
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
