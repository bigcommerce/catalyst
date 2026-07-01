import { Command } from 'commander';
import { execa } from 'execa';
import { existsSync, lstatSync, symlinkSync } from 'node:fs';
import { join, relative } from 'node:path';

import { consola } from '../lib/logger';
import { getProjectState } from '../lib/project-state';

export const start = new Command('start')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Start a local preview of your Catalyst storefront using the OpenNext Cloudflare adapter.',
  )
  .addHelpText(
    'after',
    `
Example:
  $ catalyst start`,
  )
  .action(async () => {
    // Project must be transformed before the OpenNext preview can run. If it
    // isn't, fall through to `next start` so this command works for self-hosted
    // Catalyst projects too.
    const state = getProjectState();

    if (!state.isTransformed) {
      consola.info('Project is not set up for Commerce Hosting — running `next start`.');

      await execa('pnpm', ['exec', 'next', 'start'], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      return;
    }

    const envLocal = join(process.cwd(), '.env.local');
    const devVars = join(process.cwd(), '.bigcommerce', '.dev.vars');

    if (existsSync(envLocal)) {
      if (!existsSync(devVars)) {
        const target = relative(join(process.cwd(), '.bigcommerce'), envLocal);

        symlinkSync(target, devVars);
        consola.success('Symlinked .bigcommerce/.dev.vars → .env.local');
      } else if (!lstatSync(devVars).isSymbolicLink()) {
        consola.warn(
          '.bigcommerce/.dev.vars already exists and is not a symlink. ' +
            'Wrangler will use it instead of .env.local.',
        );
      }
    } else {
      consola.warn(
        'No .env.local file found. The preview server may fail without environment variables.\n' +
          'Create a .env.local file in your project root with the required variables.',
      );
    }

    await execa(
      'pnpm',
      [
        'exec',
        'opennextjs-cloudflare',
        'preview',
        '--config',
        join('.bigcommerce', 'wrangler.jsonc'),
      ],
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      },
    );
  });
