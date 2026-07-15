import { Command } from 'commander';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { collectDiagnostics, type Diagnostics } from '../lib/collect-diagnostics';
import { consola } from '../lib/logger';
import { program } from '../program';

import { debug } from './debug';

vi.mock('../lib/collect-diagnostics', () => ({
  collectDiagnostics: vi.fn(),
}));

const fullDiagnostics: Diagnostics = {
  cli: { name: '@bigcommerce/catalyst', version: '9.9.9' },
  runtime: {
    node: 'v20.0.0',
    platform: 'darwin',
    arch: 'arm64',
    osRelease: '25.5.0',
    packageManager: 'pnpm',
  },
  project: {
    cwd: '/tmp/project',
    coreName: '@bigcommerce/catalyst-core',
    coreVersion: '1.8.0',
    projectUuid: 'uuid-123',
    isLinked: true,
    isTransformed: true,
    isFullySetUp: true,
    hasMiddleware: true,
    hasProxy: false,
    hasOpenNextDep: true,
  },
  config: {
    storeHash: { present: true, source: 'project.json' },
    accessToken: { present: true, source: 'process.env' },
    projectUuid: { present: true, source: 'project.json' },
    projectJsonKeys: ['projectUuid', 'storeHash'],
    storedEnvKeys: ['FOO', 'BAR'],
    // Both branches of the source formatter (set-with-source and unset).
    cliEnvVars: { CATALYST_STORE_HASH: 'process.env', CATALYST_PROJECT_UUID: 'unset' },
    buildEnvVars: { AUTH_SECRET: '.env.local', BIGCOMMERCE_CHANNEL_ID: 'unset' },
  },
  telemetry: { enabled: true, correlationId: 'corr-abc' },
  // Both branches of the presence formatter.
  files: { '.env.local': true, '.env': false },
};

const emptyDiagnostics: Diagnostics = {
  cli: { name: '@bigcommerce/catalyst', version: '9.9.9' },
  runtime: {
    node: 'v20.0.0',
    platform: 'linux',
    arch: 'x64',
    osRelease: '6.0.0',
    packageManager: 'npm',
  },
  project: {
    cwd: '/tmp/empty',
    coreName: null,
    coreVersion: null,
    projectUuid: null,
    isLinked: false,
    isTransformed: false,
    isFullySetUp: false,
    hasMiddleware: false,
    hasProxy: false,
    hasOpenNextDep: false,
  },
  config: {
    storeHash: { present: false, source: 'unset' },
    accessToken: { present: false, source: 'unset' },
    projectUuid: { present: false, source: 'unset' },
    projectJsonKeys: [],
    storedEnvKeys: [],
    cliEnvVars: {},
    buildEnvVars: {},
  },
  telemetry: { enabled: false, correlationId: 'corr-xyz' },
  files: {},
};

// The report is the last consola.log call (the program banner also logs, at
// import time, so we take the most recent call rather than relying on order).
const lastLogOutput = (): string => {
  const calls = vi.mocked(consola.log).mock.calls;

  return calls.length > 0 ? String(calls[calls.length - 1][0]) : '';
};

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

test('properly configured Command instance', () => {
  expect(debug).toBeInstanceOf(Command);
  expect(debug.name()).toBe('debug');
  expect(debug.description()).toContain('diagnostic report');
  expect(debug.options).toEqual(
    expect.arrayContaining([expect.objectContaining({ long: '--json' })]),
  );
});

test('prints a human-readable report by default', async () => {
  vi.mocked(collectDiagnostics).mockReturnValue(fullDiagnostics);

  await program.parseAsync(['node', 'catalyst', 'debug']);

  const output = lastLogOutput();

  expect(output).toContain('Catalyst CLI Diagnostics');
  expect(output).toContain('@bigcommerce/catalyst');
  expect(output).toContain('pnpm');
  expect(output).toContain('Catalyst core:      @bigcommerce/catalyst-core@1.8.0');
  expect(output).toContain('Project UUID:       uuid-123');
  expect(output).toContain('Linked:             yes');
  expect(output).toContain('middleware.ts:      present');
  expect(output).toContain('proxy.ts:           absent');
  expect(output).toContain('OpenNext dep:       installed');
  expect(output).toContain('Store hash:         present (source: project.json)');
  expect(output).toContain('Access token:       present (source: process.env)');
  expect(output).toContain('project.json keys:  projectUuid, storeHash');
  expect(output).toContain('Stored env keys:    FOO, BAR');
  expect(output).toContain('CLI environment variables (used to run the CLI)');
  expect(output).toContain('CATALYST_STORE_HASH: set (process.env)');
  expect(output).toContain('CATALYST_PROJECT_UUID: not set');
  expect(output).toContain('Build environment variables (used to build the Next.js app)');
  expect(output).toContain('AUTH_SECRET: set (.env.local)');
  expect(output).toContain('BIGCOMMERCE_CHANNEL_ID: not set');
  expect(output).toContain('Enabled:            yes');
  expect(output).toContain('Correlation ID:     corr-abc');
  expect(output).toContain('.env.local: present');
  expect(output).toContain('.env: absent');
});

test('renders the empty-project branches', async () => {
  vi.mocked(collectDiagnostics).mockReturnValue(emptyDiagnostics);

  await program.parseAsync(['node', 'catalyst', 'debug']);

  const output = lastLogOutput();

  expect(output).toContain('Catalyst core:      (unknown)');
  expect(output).toContain('Project UUID:       (not linked)');
  expect(output).toContain('Linked:             no');
  expect(output).toContain('OpenNext dep:       not installed');
  expect(output).toContain('Store hash:         not set');
  expect(output).toContain('project.json keys:  (none)');
  expect(output).toContain('Stored env keys:    (none)');
  expect(output).toContain('Enabled:            no');
});

test('shows the core version alone when the package name is unknown', async () => {
  vi.mocked(collectDiagnostics).mockReturnValue({
    ...emptyDiagnostics,
    project: { ...emptyDiagnostics.project, coreName: null, coreVersion: '3.2.1' },
  });

  await program.parseAsync(['node', 'catalyst', 'debug']);

  expect(lastLogOutput()).toContain('Catalyst core:      3.2.1');
});

test('--json prints machine-readable output', async () => {
  vi.mocked(collectDiagnostics).mockReturnValue(fullDiagnostics);

  await program.parseAsync(['node', 'catalyst', 'debug', '--json']);

  const output = lastLogOutput();

  expect(() => {
    JSON.parse(output);
  }).not.toThrow();
  expect(JSON.parse(output)).toEqual(fullDiagnostics);
});
