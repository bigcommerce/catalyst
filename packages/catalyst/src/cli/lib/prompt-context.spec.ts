import { Command } from '@commander-js/extra-typings';
import { afterEach, expect, test, vi } from 'vitest';

import { hintsDisabled, isQuietPromptError, resolveCommandCredentials } from './prompt-context';

const projectConfig = new Map<string, string>();

vi.mock('./project-config', () => ({
  getProjectConfig: () => ({ get: (key: string) => projectConfig.get(key) }),
}));

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

  return command.parse(args, { from: 'user' });
}

test.each(['ExitPromptError', 'AbortPromptError'])('%s is a quiet prompt error', (name) => {
  const error = new Error('prompt');

  error.name = name;

  expect(isQuietPromptError(error)).toBe(true);
});

test('other errors are not quiet prompt errors', () => {
  expect(isQuietPromptError(new Error('ExitPromptError'))).toBe(false);
  expect(isQuietPromptError('ExitPromptError')).toBe(false);
});

test('hintsDisabled with --no-hints or CATALYST_NO_HINTS', () => {
  expect(hintsDisabled(parsedCommand())).toBe(false);
  expect(hintsDisabled(parsedCommand('--no-hints'))).toBe(true);

  vi.stubEnv('CATALYST_NO_HINTS', '1');

  expect(hintsDisabled(parsedCommand())).toBe(true);
});

test('resolveCommandCredentials prefers the command options over the project config', () => {
  projectConfig.set('storeHash', 'config-store');
  projectConfig.set('accessToken', 'config-token');
  projectConfig.set('apiHost', 'api.config.com');

  expect(
    resolveCommandCredentials(
      parsedCommand(
        ...['--store-hash', 'flag-store', '--access-token', 'flag-token'],
        ...['--api-host', 'api.flag.com'],
      ),
    ),
  ).toEqual({ storeHash: 'flag-store', accessToken: 'flag-token', apiHost: 'api.flag.com' });

  expect(resolveCommandCredentials(parsedCommand())).toEqual({
    storeHash: 'config-store',
    accessToken: 'config-token',
    apiHost: 'api.config.com',
  });
});

test('resolveCommandCredentials uses the project config when no command ran', () => {
  projectConfig.set('storeHash', 'config-store');
  projectConfig.set('accessToken', 'config-token');

  expect(resolveCommandCredentials(undefined)).toEqual({
    storeHash: 'config-store',
    accessToken: 'config-token',
    apiHost: 'api.bigcommerce.com',
  });
});

test('resolveCommandCredentials returns undefined without a token', () => {
  projectConfig.set('storeHash', 'config-store');

  expect(resolveCommandCredentials(parsedCommand())).toBeUndefined();
});
