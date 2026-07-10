import { Option } from '@commander-js/extra-typings';
import { Command } from 'commander';
import { colorize } from 'consola/utils';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import PACKAGE_INFO from '../../package.json';

import { auth } from './commands/auth';
import { build } from './commands/build';
import { channel } from './commands/channel';
import { create } from './commands/create';
import { deploy } from './commands/deploy';
import { domains } from './commands/domains';
import { env } from './commands/env';
import { logs } from './commands/logs';
import { project } from './commands/project';
import { start } from './commands/start';
import { telemetry } from './commands/telemetry';
import { upgrade } from './commands/upgrade';
import { version } from './commands/version';
import { telemetryPostHook, telemetryPreHook } from './hooks/telemetry';
import { consola } from './lib/logger';

// Env files are never auto-loaded. Pass `--env-path <path>` to load one
// explicitly (see the option below). This avoids the confusing `.env` vs
// `.env.local` asymmetry and keeps configuration explicit.

// CATALYST_STORE_HASH falls back to BIGCOMMERCE_STORE_HASH so freshly-scaffolded
// projects work without duplicating the same value under two names. Aliasing
// here means every command's `.env('CATALYST_STORE_HASH')` binding picks it up
// without per-command changes.
if (!process.env.CATALYST_STORE_HASH && process.env.BIGCOMMERCE_STORE_HASH) {
  process.env.CATALYST_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
}

export const program = new Command();

consola.log(colorize('cyanBright', `◢ ${PACKAGE_INFO.name} v${PACKAGE_INFO.version}\n`));

program
  .name(PACKAGE_INFO.name)
  .version(PACKAGE_INFO.version)
  .summary('CLI tool for Catalyst development')
  .description(
    'CLI tool for Catalyst development.\n\nConfiguration priority: flags > env file (--env-path) > process.env > .bigcommerce/project.json.\n\nCATALYST_STORE_HASH falls back to BIGCOMMERCE_STORE_HASH if unset.\n\nRun `catalyst <command> --help` for details on a specific command.',
  )
  .configureHelp({ showGlobalOptions: true })
  .addOption(
    new Option(
      '--env-path <path>',
      'Path to an environment file to load (relative to the current working directory). Env files are not loaded automatically; pass e.g. `--env-path .env.local` to load one.',
      // We are using argParser, because commander loads in environment variables before executing hooks.
    ).argParser((value) => {
      if (value) {
        const envFilePath = resolve(process.cwd(), value);
        const result = config({
          path: envFilePath,
          override: true,
        });

        if (result.error) {
          const errCode =
            'code' in result.error && typeof result.error.code === 'string'
              ? result.error.code
              : undefined;
          const message =
            errCode === 'ENOENT'
              ? `Env file not found: ${envFilePath}`
              : `Failed to load --env-path ${value}: ${result.error.message}`;

          throw new Error(message);
        }

        consola.log(colorize('cyanBright', `Loaded environment variables from ${envFilePath}\n`));
      }

      return value;
    }),
  )
  .addCommand(version)
  .addCommand(create)
  .addCommand(start)
  .addCommand(build)
  .addCommand(deploy)
  .addCommand(domains)
  .addCommand(logs)
  .addCommand(project)
  .addCommand(env)
  .addCommand(channel)
  .addCommand(auth)
  .addCommand(upgrade)
  .addCommand(telemetry)
  .hook('preAction', telemetryPreHook)
  .hook('postAction', telemetryPostHook);
