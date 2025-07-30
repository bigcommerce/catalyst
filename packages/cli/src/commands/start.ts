import { Command } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { join } from 'node:path';

export const start = new Command('start')
  .description('Start your Catalyst storefront in optimized production mode.')
  .option('-p, --port <number>', 'Port to run the production server on (default: 3000).', '3000')
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (opts) => {
    try {
      const nextBin = join(opts.rootDir, 'node_modules', '.bin', 'next');

      // @todo conditionally run `next start` or `opennextjs-cloudflare preview` based on the framework type
      await execa(nextBin, ['start', '-p', opts.port], {
        stdio: 'inherit',
        cwd: opts.rootDir,
      });
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
