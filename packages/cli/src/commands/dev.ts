import { Command } from 'commander';
import consola from 'consola';
import { execa } from 'execa';

export const dev = new Command('dev')
  .description('Start the development server')
  .option('-p, --port <number>', 'Port to run the development server on', '3000')
  .option('--root-dir <rootDir>', 'Root directory to run development server from.', process.cwd())
  .action(async (opts) => {
    try {
      await execa('npm', ['run', 'dev'], { stdio: 'inherit', cwd: opts.rootDir });
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });
