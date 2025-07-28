import { Command } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { join } from 'node:path';

export const start = new Command('start')
  .description('Start the Catalyst server in production mode.')
  .option('-p, --port <number>', 'Port number to run the server on (default: 3000).', '3000')
  .option('--root-dir <rootDir>', 'Root directory of your Catalyst project.', process.cwd())
  .action(async (opts) => {
    try {
      const nextBin = join(opts.rootDir, 'node_modules', '.bin', 'next');

      // @todo conditionally run `next start` or `opennextjs-cloudflare preview` based on the framework type
      await execa({
        stdio: 'inherit',
        cwd: opts.rootDir,
      })`${nextBin} start`;
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });
