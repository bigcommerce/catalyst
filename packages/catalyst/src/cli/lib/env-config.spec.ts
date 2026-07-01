import { describe, expect, test } from 'vitest';

import { mergeDeploymentSecrets, parseEnvAssignment, toDeploymentSecrets } from './env-config';

describe('parseEnvAssignment', () => {
  test('parses a basic KEY=VALUE assignment', () => {
    expect(parseEnvAssignment('FOO=bar')).toEqual({ key: 'FOO', value: 'bar' });
  });

  test('splits on the first = so values containing = survive', () => {
    expect(parseEnvAssignment('TOKEN=abc=def==')).toEqual({ key: 'TOKEN', value: 'abc=def==' });
  });

  test('trims surrounding whitespace', () => {
    expect(parseEnvAssignment('  FOO = bar ')).toEqual({ key: 'FOO', value: 'bar' });
  });

  test('throws when there is no =', () => {
    expect(() => parseEnvAssignment('FOO')).toThrow(
      'Invalid env var format: FOO. Expected format: KEY=VALUE',
    );
  });

  test('throws when the value is empty', () => {
    expect(() => parseEnvAssignment('FOO=')).toThrow(
      'Invalid env var format: FOO=. Expected format: KEY=VALUE',
    );
  });

  test('throws when the key is not a valid env var name', () => {
    expect(() => parseEnvAssignment('1FOO=bar')).toThrow('Invalid env var name: 1FOO');
    expect(() => parseEnvAssignment('FOO-BAR=baz')).toThrow('Invalid env var name: FOO-BAR');
  });
});

describe('toDeploymentSecrets', () => {
  test('maps an env map into secret payload entries', () => {
    expect(toDeploymentSecrets({ FOO: 'bar', BAZ: 'qux' })).toEqual([
      { type: 'secret', key: 'FOO', value: 'bar' },
      { type: 'secret', key: 'BAZ', value: 'qux' },
    ]);
  });

  test('returns an empty array for an empty map', () => {
    expect(toDeploymentSecrets({})).toEqual([]);
  });
});

describe('mergeDeploymentSecrets', () => {
  test('merges both sets with flag secrets overriding persisted on conflict', () => {
    const persisted = toDeploymentSecrets({ PERSISTED_ONLY: 'keep', SHARED: 'stored' });
    const flagSecrets = toDeploymentSecrets({ SHARED: 'override', FLAG_ONLY: 'flag' });

    const merged = mergeDeploymentSecrets(persisted, flagSecrets);

    expect(merged).toEqual([
      { type: 'secret', key: 'PERSISTED_ONLY', value: 'keep' },
      { type: 'secret', key: 'SHARED', value: 'override' },
      { type: 'secret', key: 'FLAG_ONLY', value: 'flag' },
    ]);
  });

  test('returns persisted secrets when there are no flag secrets', () => {
    const persisted = toDeploymentSecrets({ FOO: 'bar' });

    expect(mergeDeploymentSecrets(persisted, [])).toEqual([
      { type: 'secret', key: 'FOO', value: 'bar' },
    ]);
  });
});
