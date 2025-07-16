import { Command } from 'commander';
import consola from 'consola';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';

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

export async function mkTempDir() {
  const prefix = join(tmpdir(), 'catalyst-build-');
  const path = await mkdtemp(prefix);

  consola.info(`Created temporary directory: ${path}`);

  return [
    path,
    async () => {
      try {
        consola.info(`Cleaning up temporary directory: ${path}`);
        await rm(path, { recursive: true, force: true });
        consola.success('Cleanup complete');
      } catch (error) {
        consola.warn(`Failed to clean up temporary directory: ${path}`, error);
      }
    },
  ] as const;
}

export const build = new Command('build')
  .option('--keep-temp-dir', 'Keep the temporary directory after the build')
  .action(async (options) => {
    const [tmpDir, rmTempDir] = await mkTempDir();

    try {
      consola.start('Copying project to temp directory...');

      const cwd = process.cwd();

      await cp(cwd, tmpDir, {
        recursive: true,
        force: true,
        preserveTimestamps: true,
        filter: createFilter(cwd, SKIP_DIRS),
      });

      consola.success(`Project copied to temp directory: ${tmpDir}`);
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
