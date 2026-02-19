import Conf from 'conf';
import { afterAll, afterEach, beforeAll, expect, MockInstance, test, vi } from 'vitest';

import { consola } from './logger';
import { mkTempDir } from './mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from './project-config';
import { resolveCredentials } from './resolve-credentials';

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  config = getProjectConfig();
});

afterEach(() => {
  vi.clearAllMocks();
  config.delete('storeHash');
  config.delete('accessToken');
});

afterAll(async () => {
  vi.restoreAllMocks();
  exitMock.mockRestore();
  await cleanup();
});

test('returns credentials from options when both provided', () => {
  const result = resolveCredentials({ storeHash: 'opt-hash', accessToken: 'opt-token' }, config);

  expect(result).toEqual({ storeHash: 'opt-hash', accessToken: 'opt-token' });
  expect(exitMock).not.toHaveBeenCalled();
});

test('falls back to config when options missing', () => {
  config.set('storeHash', 'cfg-hash');
  config.set('accessToken', 'cfg-token');

  const result = resolveCredentials({}, config);

  expect(result).toEqual({ storeHash: 'cfg-hash', accessToken: 'cfg-token' });
  expect(exitMock).not.toHaveBeenCalled();
});

test('options take precedence over config', () => {
  config.set('storeHash', 'cfg-hash');
  config.set('accessToken', 'cfg-token');

  const result = resolveCredentials({ storeHash: 'opt-hash', accessToken: 'opt-token' }, config);

  expect(result).toEqual({ storeHash: 'opt-hash', accessToken: 'opt-token' });
});

test('mixed resolution: option storeHash + config accessToken', () => {
  config.set('accessToken', 'cfg-token');

  const result = resolveCredentials({ storeHash: 'opt-hash' }, config);

  expect(result).toEqual({ storeHash: 'opt-hash', accessToken: 'cfg-token' });
});

test('exits with error when no credentials found anywhere', () => {
  expect(() => resolveCredentials({}, config)).toThrow('Missing credentials');

  expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
  expect(exitMock).toHaveBeenCalledWith(1);
});

test('error message mentions catalyst auth login', () => {
  expect(() => resolveCredentials({}, config)).toThrow();

  expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('catalyst auth login'));
});
