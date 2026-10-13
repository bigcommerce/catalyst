import { homedir } from 'node:os';
import { expect, test, vi } from 'vitest';

import { diagnosticsReportSection, redactHome } from './diagnostics-section';

vi.mock('node:os', () => ({ homedir: vi.fn(() => '/Users/me') }));
vi.mock('./collect-diagnostics', () => ({ collectDiagnostics: vi.fn() }));
vi.mock('./format-diagnostics', () => ({
  formatDiagnosticsReport: () => 'Directory: /Users/me/shop',
}));

test('redactHome replaces every occurrence of the home directory', () => {
  expect(redactHome('/Users/me/a and /Users/me/b')).toBe('~/a and ~/b');
  expect(redactHome('/srv/shop')).toBe('/srv/shop');
});

test('redactHome leaves the text as is when the home directory is unknown', () => {
  vi.mocked(homedir).mockReturnValueOnce('');

  expect(redactHome('/srv/shop')).toBe('/srv/shop');
});

test('diagnosticsReportSection sends the debug report without the home directory', () => {
  expect(diagnosticsReportSection()).toEqual({
    title: 'Catalyst CLI diagnostics',
    body: 'Directory: ~/shop',
  });
});
