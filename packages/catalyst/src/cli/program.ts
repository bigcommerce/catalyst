import { Command } from 'commander';
import { colorize } from 'consola/utils';

import PACKAGE_INFO from '../../package.json';

import { auth } from './commands/auth';
import { build } from './commands/build';
import { channel } from './commands/channel';
import { create } from './commands/create';
import { debug } from './commands/debug';
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

// Env files are only loaded by `build` and `deploy` (which auto-load
// .env.local and .env, or an explicit `--env-path`). No other command reads env
// files, so running the CLI can't be surprised by a stray `.env.local` on disk.

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
    'CLI tool for Catalyst development.\n\nConfiguration priority: flags > process.env > .bigcommerce/project.json. `build` and `deploy` additionally load env files (--env-path, or an auto-loaded .env.local/.env) for the build.\n\nCATALYST_STORE_HASH falls back to BIGCOMMERCE_STORE_HASH if unset.\n\nRun `catalyst <command> --help` for details on a specific command.',
  )
  .configureHelp({ showGlobalOptions: true })
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
  .addCommand(debug)
  .hook('preAction', telemetryPreHook)
  .hook('postAction', telemetryPostHook);
