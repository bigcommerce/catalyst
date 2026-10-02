import { Command } from '@commander-js/extra-typings';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  hintsDisabled,
  isQuietPromptError,
  QUIET_PROMPT_ERRORS,
  resolveCommandCredentials,
} from './prompt-context';

const projectConfig = new Map<string, string>();

vi.mock('./project-config', () => ({
  getProjectConfig: () => ({ get: (key: string) => projectConfig.get(key) }),
}));

const ENV_KEYS = [
  'CATALYST_NO_HINTS',
  'CATALYST_STORE_HASH',
  'CATALYST_ACCESS_TOKEN',
  'CATALYST_API_HOST',
] as const;

beforeEach(() => {
  ENV_KEYS.forEach((key) => vi.stubEnv(key, undefined));
});

afterEach(() => {
  projectConfig.clear();
  vi.unstubAllEnvs();
});

function parsedCommand(...args: string[]) {
  const command = new Command('deploy')
    .exitOverride()
    .option('--store-hash <hash>')
    .option('--access-token <token>')
    .option('--api-host <host>')
    .option('--no-hints');

  command.parse(args, { from: 'user' });

  return command;
}

test('isQuietPromptError', () => {
  QUIET_PROMPT_ERRORS.forEach((name) => {
    const error = new Error('prompt');

    error.name = name;

    expect(isQuietPromptError(error)).toBe(true);
  });

  expect(isQuietPromptError(new Error('other'))).toBe(false);
  expect(isQuietPromptError('ExitPromptError')).toBe(false);
});

test('hintsDisabled', () => {
  expect(hintsDisabled(undefined)).toBe(false);
  expect(hintsDisabled(parsedCommand())).toBe(false);
  expect(hintsDisabled(parsedCommand('--no-hints'))).toBe(true);

  vi.stubEnv('CATALYST_NO_HINTS', '1');

  expect(hintsDisabled(parsedCommand())).toBe(true);
});

test('resolveCommandCredentials prefers options, then env, then the project config', () => {
  projectConfig.set('storeHash', 'config-store');
  projectConfig.set('accessToken', 'config-token');
  projectConfig.set('apiHost', 'api.config.com');

  expect(resolveCommandCredentials(undefined)).toEqual({
    storeHash: 'config-store',
    accessToken: 'config-token',
    apiHost: 'api.config.com',
  });

  vi.stubEnv('CATALYST_STORE_HASH', 'env-store');
  vi.stubEnv('CATALYST_ACCESS_TOKEN', 'env-token');
  vi.stubEnv('CATALYST_API_HOST', 'api.env.com');

  expect(resolveCommandCredentials(parsedCommand())).toEqual({
    storeHash: 'env-store',
    accessToken: 'env-token',
    apiHost: 'api.env.com',
  });

  expect(
    resolveCommandCredentials(
      parsedCommand(
        '--store-hash',
        'flag-store',
        '--access-token',
        'flag-token',
        '--api-host',
        'api.flag.com',
      ),
    ),
  ).toEqual({ storeHash: 'flag-store', accessToken: 'flag-token', apiHost: 'api.flag.com' });
});

test('resolveCommandCredentials uses the default API host', () => {
  projectConfig.set('storeHash', 'config-store');
  projectConfig.set('accessToken', 'config-token');

  expect(resolveCommandCredentials(undefined)?.apiHost).toBe('api.bigcommerce.com');
});

test('resolveCommandCredentials returns undefined without a store hash or token', () => {
  expect(resolveCommandCredentials(undefined)).toBeUndefined();

  projectConfig.set('storeHash', 'config-store');

  expect(resolveCommandCredentials(undefined)).toBeUndefined();
});
