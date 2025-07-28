import { Command } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { join } from 'node:path';

export const dev = new Command('dev')
  .description('Start the Catalyst development server.')
  .option(
    '-p, --port <number>',
    'Port number to run the development server on (default: 3000).',
    '3000',
  )
  .option('--root-dir <rootDir>', 'Root directory of your Catalyst project.', process.cwd())
  .action(async (opts) => {
    try {
      const dotenvBin = join(opts.rootDir, 'node_modules', '.bin', 'dotenv');

      await execa({
        stdio: 'inherit',
        cwd: opts.rootDir,
      })`${dotenvBin} -e .env.local -- node ./scripts/generate.cjs`;

      const nextBin = join(opts.rootDir, 'node_modules', '.bin', 'next');

      await execa({
        stdio: 'inherit',
        cwd: opts.rootDir,
      })`${nextBin} dev -p ${opts.port}`;
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });
