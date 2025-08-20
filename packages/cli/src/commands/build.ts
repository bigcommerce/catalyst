import { Command, Option } from 'commander';
import consola from 'consola';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { copyFile, cp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getModuleCliPath } from '../lib/get-module-cli-path';
import { getProjectConfig } from '../lib/project-config';
import { getWranglerConfig } from '../lib/wrangler-config';

const WRANGLER_VERSION = '4.24.3';

export const build = new Command('build')
  .allowUnknownOption()
  // The unknown options end up in program.args, not in program.opts(). Commander does not take a guess at how to interpret the unknown options.
  .argument(
    '[next-build-options...]',
    'Next.js `build` options (see: https://nextjs.org/docs/app/api-reference/cli/next#next-build-options)',
  )
  .option('--project-uuid <uuid>', 'Project UUID to be included in the deployment configuration.')
  .addOption(
    new Option('--framework <framework>', 'The framework to use for the build.').choices([
      'nextjs',
      'catalyst',
    ]),
  )
  .action(async (nextBuildOptions, options) => {
    const coreDir = process.cwd();

    try {
      const config = getProjectConfig();
      const framework = options.framework ?? config.get('framework');

      if (framework === 'nextjs') {
        const nextBin = join('node_modules', '.bin', 'next');

        if (!existsSync(nextBin)) {
          throw new Error(
            `Next.js is not installed in ${coreDir}. Are you in a valid Next.js project?`,
          );
        }

        await execa(nextBin, ['build', ...nextBuildOptions], {
          stdio: 'inherit',
          cwd: coreDir,
        });
      }

      if (framework === 'catalyst') {
        const openNextOutDir = join(coreDir, '.open-next');
        const bigcommerceDistDir = join(coreDir, '.bigcommerce', 'dist');

        const projectUuid = options.projectUuid ?? config.get('projectUuid');

        if (!projectUuid) {
          throw new Error(
            'Project UUID is required. Please run `link` or provide `--project-uuid`',
          );
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

        await execa(
          'pnpm',
          ['exec', 'opennextjs-cloudflare', 'build', '--skipWranglerConfigCheck'],
          {
            stdout: ['pipe', 'inherit'],
            cwd: coreDir,
          },
        );

        await execa(
          'pnpm',
          [
            'dlx',
            `wrangler@${WRANGLER_VERSION}`,
            'deploy',
            '--config',
            join(coreDir, '.bigcommerce', 'wrangler.jsonc'),
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
      }
    } catch (error) {
      consola.error(error);
      process.exitCode = 1;
    } finally {
      await rm(join(coreDir, '.open-next.config.ts')).catch(() => null);

      process.exit();
    }
  });
