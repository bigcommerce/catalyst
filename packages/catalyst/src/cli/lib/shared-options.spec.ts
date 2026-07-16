import Conf from 'conf';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';

import { mkTempDir } from './mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from './project-config';
import { DEFAULT_API_HOST, resolveApiHost } from './shared-options';

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

beforeAll(async () => {
  [tmpDir, cleanup] = await mkTempDir();
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  config = getProjectConfig();
});

afterEach(() => {
  config.delete('apiHost');
});

afterAll(async () => {
  vi.restoreAllMocks();
  await cleanup();
});

test('returns the --api-host flag when provided', () => {
  expect(resolveApiHost({ apiHost: 'flag.example.com' }, config)).toBe('flag.example.com');
});

test('falls back to config apiHost when the flag is missing', () => {
  config.set('apiHost', 'config.example.com');

  expect(resolveApiHost({}, config)).toBe('config.example.com');
});

test('falls back to the default host when neither flag nor config is set', () => {
  expect(resolveApiHost({}, config)).toBe(DEFAULT_API_HOST);
});

test('the flag takes precedence over the config apiHost', () => {
  config.set('apiHost', 'config.example.com');

  expect(resolveApiHost({ apiHost: 'flag.example.com' }, config)).toBe('flag.example.com');
});
