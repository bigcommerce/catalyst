import type { ConfigSource, Diagnostics, ResolvedValue } from './collect-diagnostics';

const yesNo = (value: boolean): string => (value ? 'yes' : 'no');

const presence = (value: boolean): string => (value ? 'present' : 'absent');

const formatResolved = (value: ResolvedValue): string =>
  value.present ? `present (source: ${value.source})` : 'not set';

const formatSource = (source: ConfigSource): string =>
  source === 'unset' ? 'not set' : `set (${source})`;

const formatStorefront = (name: string | null, version: string | null): string => {
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
// Shared by `catalyst debug` (prints it) and `catalyst feedback` (attaches it).
export const formatDiagnosticsReport = (d: Diagnostics): string => {
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
    `  Storefront:         ${formatStorefront(d.project.storefrontName, d.project.storefrontVersion)}`,
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
    `  API host:           ${d.config.apiHost.present ? formatResolved(d.config.apiHost) : 'default (api.bigcommerce.com)'}`,
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
