import { Command, Option } from 'commander';

import {
  collectDiagnostics,
  type ConfigSource,
  type Diagnostics,
  type ResolvedValue,
} from '../lib/collect-diagnostics';
import { consola } from '../lib/logger';

const yesNo = (value: boolean): string => (value ? 'yes' : 'no');

const presence = (value: boolean): string => (value ? 'present' : 'absent');

const formatResolved = (value: ResolvedValue): string =>
  value.present ? `present (source: ${value.source})` : 'not set';

const formatSource = (source: ConfigSource): string =>
  source === 'unset' ? 'not set' : `set (${source})`;

const formatCore = (name: string | null, version: string | null): string => {
  if (!version) {
    return '(unknown)';
  }

  return name ? `${name}@${version}` : version;
};

const formatList = (values: string[]): string => (values.length > 0 ? values.join(', ') : '(none)');

const envVarLines = (vars: Record<string, ConfigSource>): string[] =>
  Object.entries(vars).map(([name, source]) => `  ${name}: ${formatSource(source)}`);

// Build a human-readable, copy-pasteable report. Kept to plain text (no colors)
// so it survives a paste into a GitHub issue or support ticket unchanged.
const formatReport = (d: Diagnostics): string => {
  const lines = [
    'Catalyst CLI Diagnostics',
    '',
    'CLI',
    `  Package:            ${d.cli.name}`,
    `  Version:            ${d.cli.version}`,
    '',
    'Runtime',
    `  Node:               ${d.runtime.node}`,
    `  Platform:           ${d.runtime.platform} (${d.runtime.arch})`,
    `  OS release:         ${d.runtime.osRelease}`,
    `  Package manager:    ${d.runtime.packageManager}`,
    '',
    'Project',
    `  Directory:          ${d.project.cwd}`,
    `  Catalyst core:      ${formatCore(d.project.coreName, d.project.coreVersion)}`,
    `  Project UUID:       ${d.project.projectUuid ?? '(not linked)'}`,
    `  Linked:             ${yesNo(d.project.isLinked)}`,
    `  Transformed:        ${yesNo(d.project.isTransformed)}`,
    `  Fully set up:       ${yesNo(d.project.isFullySetUp)}`,
    `  middleware.ts:      ${presence(d.project.hasMiddleware)}`,
    `  proxy.ts:           ${presence(d.project.hasProxy)}`,
    `  OpenNext dep:       ${d.project.hasOpenNextDep ? 'installed' : 'not installed'}`,
    '',
    'Config (resolved without secrets)',
    `  Store hash:         ${formatResolved(d.config.storeHash)}`,
    `  Access token:       ${formatResolved(d.config.accessToken)}`,
    `  Project UUID:       ${formatResolved(d.config.projectUuid)}`,
    `  project.json keys:  ${formatList(d.config.projectJsonKeys)}`,
    `  Stored env keys:    ${formatList(d.config.storedEnvKeys)}`,
    '',
    'CLI environment variables (used to run the CLI)',
    ...envVarLines(d.config.cliEnvVars),
    '',
    'Build environment variables (used to build the Next.js app)',
    ...envVarLines(d.config.buildEnvVars),
    '',
    'Telemetry',
    `  Enabled:            ${yesNo(d.telemetry.enabled)}`,
    `  Correlation ID:     ${d.telemetry.correlationId}`,
    '',
    'Files',
    ...Object.entries(d.files).map(([name, exists]) => `  ${name}: ${presence(exists)}`),
  ];

  return lines.join('\n');
};

export const debug = new Command('debug')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Print a diagnostic report (CLI, runtime, project, and config state) to include when filing a bug report. Never prints secret values — credentials and env vars are reported by presence only.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Print a human-readable report
  $ catalyst debug

  # Print machine-readable JSON (useful for copy/paste or piping)
  $ catalyst debug --json`,
  )
  .addOption(new Option('--json', 'Output the report as JSON.'))
  .action((options: { json?: boolean }) => {
    const diagnostics = collectDiagnostics();

    if (options.json) {
      consola.log(JSON.stringify(diagnostics, null, 2));

      return;
    }

    consola.log(formatReport(diagnostics));
  });
