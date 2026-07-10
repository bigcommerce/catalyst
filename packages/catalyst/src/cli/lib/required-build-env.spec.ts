import { describe, expect, test } from 'vitest';

import { UserActionableError } from './errors';
import {
  assertRequiredBuildEnv,
  findMissingBuildEnv,
  REQUIRED_BUILD_ENV_VARS,
} from './required-build-env';

const completeEnv = (): NodeJS.ProcessEnv => ({
  BIGCOMMERCE_STORE_HASH: 'abc123',
  BIGCOMMERCE_STOREFRONT_TOKEN: 'token',
  AUTH_SECRET: 'secret',
});

describe('findMissingBuildEnv', () => {
  test('returns an empty array when every required var is set', () => {
    expect(findMissingBuildEnv(completeEnv())).toEqual([]);
  });

  test('reports vars that are unset', () => {
    const env = completeEnv();

    delete env.BIGCOMMERCE_STOREFRONT_TOKEN;

    expect(findMissingBuildEnv(env)).toEqual(['BIGCOMMERCE_STOREFRONT_TOKEN']);
  });

  test('treats empty or whitespace-only values as missing', () => {
    const env = { ...completeEnv(), BIGCOMMERCE_STORE_HASH: '', AUTH_SECRET: '   ' };

    expect(findMissingBuildEnv(env)).toEqual(['BIGCOMMERCE_STORE_HASH', 'AUTH_SECRET']);
  });

  test('reports all missing vars when the env is empty', () => {
    expect(findMissingBuildEnv({})).toEqual([...REQUIRED_BUILD_ENV_VARS]);
  });
});

describe('assertRequiredBuildEnv', () => {
  test('does not throw when every required var is set', () => {
    expect(() => assertRequiredBuildEnv(completeEnv())).not.toThrow();
  });

  test('throws a UserActionableError naming the missing vars', () => {
    expect(() => assertRequiredBuildEnv({})).toThrow(UserActionableError);

    REQUIRED_BUILD_ENV_VARS.forEach((name) => {
      expect(() => assertRequiredBuildEnv({})).toThrow(new RegExp(name));
    });
  });

  test('suggests --env-path and .env.local in the message', () => {
    const env = completeEnv();

    delete env.AUTH_SECRET;

    expect(() => assertRequiredBuildEnv(env)).toThrow(/--env-path/);
    expect(() => assertRequiredBuildEnv(env)).toThrow(/\.env\.local/);
  });
});
