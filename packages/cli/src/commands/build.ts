import { Command, Option } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { copyFile, cp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getModuleCliPath } from '../lib/get-module-cli-path';
import { getProjectConfig } from '../lib/project-config';
import { getWranglerConfig } from '../lib/wrangler-config';

const WRANGLER_VERSION = '4.24.3';

export const build = new Command('build')
  .option('--project-uuid <uuid>', 'Project UUID to be included in the deployment configuration.')
  .addOption(
    new Option('--framework <framework>', 'The framework to use for the build.').choices([
      'nextjs',
      'catalyst',
    ]),
  )
  .action(async (options) => {
    const coreDir = process.cwd();

    try {
      const openNextOutDir = join(coreDir, '.open-next');
      const bigcommerceDistDir = join(coreDir, '.bigcommerce', 'dist');

      const config = getProjectConfig();
      const projectUuid = options.projectUuid ?? config.get('projectUuid');

      if (!projectUuid) {
        throw new Error('Project UUID is required. Please run `link` or provide `--project-uuid`');
      }

      const wranglerConfig = getWranglerConfig(projectUuid, 'PLACEHOLDER_KV_ID');

      consola.start('Copying templates...');

      await copyFile(
        join(getModuleCliPath(), 'templates', 'open-next.config.ts'),
        join(coreDir, 'open-next.config.ts'),
      );
      await writeFile(
        join(coreDir, '.bigcommerce', 'wrangler.jsonc'),
        JSON.stringify(wranglerConfig, null, 2),
      );

      consola.success('Templates copied');

      consola.start('Building project...');

      await execa('pnpm', ['exec', 'opennextjs-cloudflare', 'build'], {
        stdout: ['pipe', 'inherit'],
        cwd: coreDir,
      });

      await execa(
        'pnpm',
        [
          'dlx',
          `wrangler@${WRANGLER_VERSION}`,
          'deploy',
          '--keep-vars',
          '--outdir',
          bigcommerceDistDir,
          '--dry-run',
        ],
        {
          stdout: ['pipe', 'inherit'],
          cwd: coreDir,
        },
      );

      consola.success('Project built');

      await cp(join(openNextOutDir, 'assets'), join(bigcommerceDistDir, 'assets'), {
        recursive: true,
        force: true,
      });
    } catch (error) {
      consola.error(error);
      process.exitCode = 1;
    } finally {
      await rm(join(coreDir, '.open-next.config.ts')).catch(() => null);

      process.exit();
    }
  });
