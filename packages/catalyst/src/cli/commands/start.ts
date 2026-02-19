import { Command } from 'commander';
import { execa } from 'execa';
import { join } from 'node:path';

export const start = new Command('start')
  .description(
    'Start a local preview of your Catalyst storefront using the OpenNext Cloudflare adapter.',
  )
  .action(async () => {
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
