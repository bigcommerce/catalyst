import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, test, vi } from 'vitest';

import { collectDiagnostics, type Diagnostics } from './collect-diagnostics';
import { diagnosticsReportSection, redactHome } from './diagnostics-section';

vi.mock('./collect-diagnostics', () => ({ collectDiagnostics: vi.fn() }));

test('redactHome replaces every occurrence of the home directory', () => {
  expect(redactHome('/Users/me/a and /Users/me/b', '/Users/me')).toBe('~/a and ~/b');
  expect(redactHome('/srv/shop', '/Users/me')).toBe('/srv/shop');
});

test('redactHome does nothing when the home directory is unknown', () => {
  expect(redactHome('/srv/shop', '')).toBe('/srv/shop');
});

test('redactHome defaults to the OS home directory', () => {
  expect(redactHome(join(homedir(), 'shop'))).toBe(`~${join('/', 'shop')}`);
});

test('diagnosticsReportSection formats the debug report with the home directory redacted', () => {
  const diagnostics: Diagnostics = {
    cli: { name: '@bigcommerce/catalyst', version: '9.9.9' },
    runtime: {
      node: 'v22.0.0',
      platform: 'linux',
      arch: 'x64',
      osRelease: '6.0.0',
      packageManager: 'pnpm',
    },
    project: {
      cwd: join(homedir(), 'shop'),
      storefrontName: null,
      storefrontVersion: null,
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
      apiHost: { present: false, source: 'unset' },
      projectJsonKeys: [],
      storedEnvKeys: [],
      cliEnvVars: {},
      buildEnvVars: {},
    },
    telemetry: { enabled: false, correlationId: 'corr' },
    files: {},
  };

  vi.mocked(collectDiagnostics).mockReturnValue(diagnostics);

  const section = diagnosticsReportSection();

  expect(section.title).toBe('Catalyst CLI diagnostics');
  expect(section.body).toContain('Catalyst CLI Diagnostics');
  expect(section.body).toContain(`~${join('/', 'shop')}`);
  expect(section.body).not.toContain(homedir());
});
