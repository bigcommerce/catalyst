import { Command, InvalidArgumentError, Option } from 'commander';
import { execa } from 'execa';
import { copyFile, cp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { valid as validSemver } from 'semver';

import { loadBuildEnv } from '../lib/build-env';
import { reconcileOpenNextVersion } from '../lib/commerce-hosting';
import { detectProjectPackageManager } from '../lib/detect-package-manager';
import { getModuleCliPath } from '../lib/get-module-cli-path';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { getProjectState } from '../lib/project-state';
import { assertRequiredBuildEnv } from '../lib/required-build-env';
import { envPathOption } from '../lib/shared-options';
import { getWranglerConfig } from '../lib/wrangler-config';

export const WRANGLER_VERSION = '4.128.0';

// npm dist-tags (e.g. latest, beta) aren't valid semver, so they're allowed
// through a narrow character allowlist. This also guards the value before
// it's interpolated into the `wrangler@<version>` spec passed to `pnpm dlx`,
// rejecting anything that could smuggle extra args or shell metacharacters in.
const DIST_TAG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export const parseWranglerVersion = (value: string): string => {
  if (!validSemver(value) && !DIST_TAG_PATTERN.test(value)) {
    throw new InvalidArgumentError(
      `"${value}" is not a valid Wrangler version or dist-tag (e.g. 4.90.0 or latest).`,
    );
  }

  return value;
};

export async function buildCatalystProject(
  projectUuid: string,
  wranglerVersion: string = WRANGLER_VERSION,
): Promise<void> {
  // Fail fast with an actionable message if the vars the build reads aren't
  // loaded — otherwise the missing values surface as a raw stack trace deep in
  // the OpenNext/Next.js prerender.
  assertRequiredBuildEnv();

  const coreDir = process.cwd();

  // The build invokes the project's own adapter, so offer to move a stale pin
  // before compiling against it. Reinstall when it moves.
  const projectPackageManager = await detectProjectPackageManager(coreDir);

  if (await reconcileOpenNextVersion(coreDir, projectPackageManager, { canUpgrade: true })) {
    await installDependencies(coreDir, projectPackageManager);
  }

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

  // Workers Assets serves `/_next/static/*` directly, bypassing the Next.js
  // server that would normally set the immutable Cache-Control on it. Its
  // default is `max-age=0, must-revalidate`, so browsers revalidate every
  // hashed asset on every repeat view. `_headers` overrides that, and has to
  // live inside the assets directory — written after the OpenNext build because
  // that build regenerates the directory, and before the Wrangler dry-run so
  // Wrangler validates it.
  await copyFile(
    join(getModuleCliPath(), 'templates', 'public_headers'),
    join(openNextOutDir, 'assets', '_headers'),
  );

  await execa(
    'pnpm',
    [
      'dlx',
      `wrangler@${wranglerVersion}`,
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
  $ catalyst build --project-uuid <UUID>

  # Build with a specific Wrangler version
  $ catalyst build --wrangler-version 4.24.3`,
  )
  .addOption(
    new Option(
      '--project-uuid <uuid>',
      'Project UUID to be included in the deployment configuration.',
    ).env('CATALYST_PROJECT_UUID'),
  )
  .addOption(
    new Option(
      '--wrangler-version <version>',
      `Wrangler version or dist-tag to build with. Defaults to ${WRANGLER_VERSION}.`,
    ).argParser(parseWranglerVersion),
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

      // `next build` reads the same storefront env vars; fail fast with an
      // actionable message here too, since this path doesn't go through
      // buildCatalystProject where the check normally runs.
      assertRequiredBuildEnv();

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
        'Project UUID is required. Please run `catalyst projects create` or `catalyst projects link` or this command again with --project-uuid <uuid>.',
      );
    }

    await buildCatalystProject(projectUuid, options.wranglerVersion);
  });
