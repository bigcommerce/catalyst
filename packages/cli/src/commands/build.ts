import { Command } from 'commander';
import consola from 'consola';
import { cp } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { addDevDependency, installDependencies, runScript } from 'nypm';

import { mkTempDir } from '../lib/mk-temp-dir';

const OPENNEXTJS_CLOUDFLARE_VERSION = '1.5.2';

const SKIP_DIRS = new Set([
  'node_modules',
  '.bigcommerce',
  '.git',
  '.turbo',
  '.next',
  '.vscode',
  '.github',
  '.changeset',
  'dist',
]);

export function createFilter(root: string, skipDirs: Set<string>) {
  return (src: string) => {
    const rel = relative(root, src);
    const parts = rel.split(sep);

    return !parts.some((part) => skipDirs.has(part));
  };
}

export const build = new Command('build')
  .option('--keep-temp-dir', 'Keep the temporary directory after the build')
  .action(async (options) => {
    const [tmpDir, rmTempDir] = await mkTempDir('catalyst-build-');

    try {
      consola.start('Copying project to temp directory...');

      const cwd = process.cwd();
      const packageManager = 'pnpm';

      await cp(cwd, tmpDir, {
        recursive: true,
        force: true,
        preserveTimestamps: true,
        filter: createFilter(cwd, SKIP_DIRS),
      });

      consola.success(`Project copied to temp directory: ${tmpDir}`);

      consola.start('Installing dependencies...');

      await installDependencies({
        cwd: tmpDir,
        packageManager,
      });

      await addDevDependency(`@opennextjs/cloudflare@${OPENNEXTJS_CLOUDFLARE_VERSION}`, {
        cwd: join(tmpDir, 'core'),
        packageManager,
      });

      consola.success('Dependencies installed');

      consola.start('Building dependencies...');

      await runScript('build', {
        cwd: join(tmpDir, 'packages', 'client'),
        packageManager,
      });

      consola.success('Dependencies built');
    } catch (error) {
      consola.error(error);
      process.exitCode = 1;
    } finally {
      if (!options.keepTempDir) {
        await rmTempDir();
      }

      process.exit();
    }
  });
