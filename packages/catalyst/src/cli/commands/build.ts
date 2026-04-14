import { Command, Option } from 'commander';
import { execa } from 'execa';
import { copyFile, cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getModuleCliPath } from '../lib/get-module-cli-path';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { getWranglerConfig } from '../lib/wrangler-config';

const WRANGLER_VERSION = '4.24.3';

export async function buildCatalystProject(projectUuid: string): Promise<void> {
  const coreDir = process.cwd();
  const openNextOutDir = join(coreDir, '.open-next');
  const bigcommerceDistDir = join(coreDir, '.bigcommerce', 'dist');

  const wranglerConfig = getWranglerConfig(projectUuid);

  consola.start('Copying templates...');

  await copyFile(
    join(getModuleCliPath(), 'templates', 'open-next.config.ts'),
    join(coreDir, '.bigcommerce', 'open-next.config.ts'),
  );
  await writeFile(
    join(coreDir, '.bigcommerce', 'wrangler.jsonc'),
    JSON.stringify(wranglerConfig, null, 2),
  );

  consola.success('Templates copied');

  consola.start('Building project...');

  await execa(
    'pnpm',
    [
      'exec',
      'opennextjs-cloudflare',
      'build',
      '--skipWranglerConfigCheck',
      '--openNextConfigPath',
      join(coreDir, '.bigcommerce', 'open-next.config.ts'),
    ],
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

export const build = new Command('build')
  .description(
    'Build your Catalyst project using the OpenNext/Cloudflare build pipeline. Also runs a Wrangler dry-run to generate deployment artifacts.',
  )
  .addHelpText(
    'after',
    `
Examples:
  $ catalyst build

  # Include project UUID
  $ catalyst build --project-uuid <UUID>`,
  )
  .addOption(
    new Option(
      '--project-uuid <uuid>',
      'Project UUID to be included in the deployment configuration.',
    ).env('CATALYST_PROJECT_UUID'),
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const projectUuid = options.projectUuid ?? config.get('projectUuid');

    if (!projectUuid) {
      throw new Error(
        'Project UUID is required. Please run `catalyst project create` or `catalyst project link` or this command again with --project-uuid <uuid>.',
      );
    }

    await buildCatalystProject(projectUuid);
  });
