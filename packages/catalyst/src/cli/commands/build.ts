import { Command, Option } from 'commander';
import { execa } from 'execa';
import { copyFile, cp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { loadBuildEnv } from '../lib/build-env';
import { getModuleCliPath } from '../lib/get-module-cli-path';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { getProjectState } from '../lib/project-state';
import { assertRequiredBuildEnv } from '../lib/required-build-env';
import { envPathOption } from '../lib/shared-options';
import { getWranglerConfig } from '../lib/wrangler-config';

const WRANGLER_VERSION = '4.90.0';

export async function buildCatalystProject(projectUuid: string): Promise<void> {
  // Fail fast with an actionable message if the vars the build reads aren't
  // loaded — otherwise the missing values surface as a raw stack trace deep in
  // the OpenNext/Next.js prerender.
  assertRequiredBuildEnv();

  const coreDir = process.cwd();
  const openNextOutDir = join(coreDir, '.open-next');
  const bigcommerceDistDir = join(coreDir, '.bigcommerce', 'dist');

  const wranglerConfig = getWranglerConfig(projectUuid);

  // Wrangler's --outdir writes alongside existing files instead of replacing
  // the directory. Stale artifacts (e.g. wasm modules named by an older
  // Wrangler version) end up in the bundle and break the Cloudflare upload.
  await rm(bigcommerceDistDir, { recursive: true, force: true });

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
  .configureHelp({ showGlobalOptions: true })
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
  .addOption(envPathOption())
  .action(async (options) => {
    // The build reads storefront env vars (BIGCOMMERCE_*). Load them from the
    // env file(s) before building so both the build and any pre-build checks
    // see them.
    loadBuildEnv({ envPath: options.envPath });

    // Project must be transformed (middleware swapped in, OpenNext dep installed)
    // before the OpenNext build pipeline can run. If it isn't, fall through to
    // `next build` so this command works for self-hosted Catalyst projects too.
    const state = getProjectState();

    if (!state.isTransformed) {
      consola.info('Project is not set up for Commerce Hosting — running `next build`.');
      consola.info('To deploy to Commerce Hosting, run `catalyst deploy`.');

      await execa('pnpm', ['exec', 'next', 'build'], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      return;
    }

    const config = getProjectConfig();
    const projectUuid = options.projectUuid ?? config.get('projectUuid');

    if (!projectUuid) {
      throw new Error(
        'Project UUID is required. Please run `catalyst project create` or `catalyst project link` or this command again with --project-uuid <uuid>.',
      );
    }

    await buildCatalystProject(projectUuid);
  });
