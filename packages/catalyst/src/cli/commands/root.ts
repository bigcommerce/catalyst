import { Command } from '@effect/cli';

import PACKAGE_INFO from '../../../package.json';

import { authCommand } from './auth';
import { buildCommand } from './build';
import { deployCommand } from './deploy';
import { projectCommand } from './project';
import { startCommand } from './start';
import { telemetryCommand } from './telemetry';
import { versionCommand } from './version';

export const rootCommand = Command.make('catalyst').pipe(
  Command.withDescription('CLI tool for Catalyst development'),
  Command.withSubcommands([
    versionCommand,
    startCommand,
    buildCommand,
    deployCommand,
    projectCommand,
    authCommand,
    telemetryCommand,
  ]),
);

export const cli = Command.run(rootCommand, {
  name: PACKAGE_INFO.name,
  version: PACKAGE_INFO.version,
});
