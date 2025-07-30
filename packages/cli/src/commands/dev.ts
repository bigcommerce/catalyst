import { Command } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { join } from 'node:path';

export const dev = new Command('dev')
  .description('Start the Catalyst development server')
  .option('-p, --port <number>', 'Port to run the development server on (default: 3000).', '3000')
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (opts) => {
    try {
      const dotenvBin = join(opts.rootDir, 'node_modules', '.bin', 'dotenv');

      await execa(dotenvBin, ['-e', '.env.local', '--', 'node', './scripts/generate.cjs'], {
        stdio: 'inherit',
        cwd: opts.rootDir,
      });

      const nextBin = join(opts.rootDir, 'node_modules', '.bin', 'next');

      await execa(nextBin, ['dev', '-p', opts.port], {
        stdio: 'inherit',
        cwd: opts.rootDir,
      });
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });
