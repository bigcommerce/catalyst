import { Command, Option } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { cp } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { addDevDependency, installDependencies, runScript } from 'nypm';

import { getModuleCliPath } from '../lib/get-module-cli-path';
import { mkTempDir } from '../lib/mk-temp-dir';

const OPENNEXTJS_CLOUDFLARE_VERSION = '1.5.2';
const WRANGLER_VERSION = '4.24.3';

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
  .option('--project-uuid <uuid>', 'Project UUID to be included in the deployment configuration.')
  .addOption(
    new Option('--framework <framework>', 'The framework to use for the build.').choices([
      'nextjs',
      'catalyst',
    ]),
  )
  .action(async (options) => {
    const [tmpDir, rmTempDir] = await mkTempDir('catalyst-build-');

    try {
      consola.start('Copying project to temp directory...');

      const packageManager = 'pnpm';

      const cwd = process.cwd();
      const tmpCoreDir = join(tmpDir, 'core');
      const wranglerOutDir = join(tmpCoreDir, '.dist');
      const openNextOutDir = join(tmpCoreDir, '.open-next');
      const bigcommerceDistDir = join(cwd, '.bigcommerce', 'dist');

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
        cwd: tmpCoreDir,
        packageManager,
      });

      consola.success('Dependencies installed');

      consola.start('Building dependencies...');

      await runScript('build', {
        cwd: join(tmpDir, 'packages', 'client'),
        packageManager,
      });

      consola.success('Dependencies built');

      consola.start('Copying templates...');

      await cp(join(getModuleCliPath(), 'templates'), tmpCoreDir, {
        recursive: true,
        force: true,
      });

      consola.success('Templates copied');

      consola.start('Building project...');

      await execa('pnpm', ['exec', 'opennextjs-cloudflare', 'build'], {
        stdout: ['pipe', 'inherit'],
        cwd: tmpCoreDir,
      });

      await execa(
        'pnpm',
        [
          'dlx',
          `wrangler@${WRANGLER_VERSION}`,
          'deploy',
          '--keep-vars',
          '--outdir',
          wranglerOutDir,
          '--dry-run',
        ],
        {
          stdout: ['pipe', 'inherit'],
          cwd: tmpCoreDir,
        },
      );

      consola.success('Project built');

      consola.start('Copying build to project...');

      await cp(wranglerOutDir, bigcommerceDistDir, {
        recursive: true,
        force: true,
      });

      await cp(join(openNextOutDir, 'assets'), join(bigcommerceDistDir, 'assets'), {
        recursive: true,
        force: true,
      });

      consola.success('Build copied to project');
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
