import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { loadBuildEnv } from './build-env';
import { UserActionableError } from './errors';
import { mkTempDir } from './mk-temp-dir';

describe('loadBuildEnv', () => {
  afterEach(() => {
    delete process.env.BUILD_ENV_TEST_A;
    delete process.env.BUILD_ENV_TEST_B;
  });

  test('loads and overrides process.env from an explicit --env-path', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    await writeFile(join(tmpDir, '.env.custom'), 'BUILD_ENV_TEST_A=from-file', 'utf-8');
    process.env.BUILD_ENV_TEST_A = 'from-process';

    try {
      loadBuildEnv({ envPath: '.env.custom', cwd: tmpDir });

      expect(process.env.BUILD_ENV_TEST_A).toBe('from-file');
    } finally {
      await cleanup();
    }
  });

  test('throws a UserActionableError when --env-path does not exist', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    try {
      expect(() => loadBuildEnv({ envPath: '.env.missing', cwd: tmpDir })).toThrow(
        UserActionableError,
      );
      expect(() => loadBuildEnv({ envPath: '.env.missing', cwd: tmpDir })).toThrow(
        /Env file not found/,
      );
    } finally {
      await cleanup();
    }
  });

  test('auto-loads .env.local and .env, with .env.local taking precedence', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    await writeFile(
      join(tmpDir, '.env'),
      'BUILD_ENV_TEST_A=from-env\nBUILD_ENV_TEST_B=only-in-env',
      'utf-8',
    );
    await writeFile(join(tmpDir, '.env.local'), 'BUILD_ENV_TEST_A=from-env-local', 'utf-8');

    try {
      loadBuildEnv({ cwd: tmpDir });

      expect(process.env.BUILD_ENV_TEST_A).toBe('from-env-local');
      expect(process.env.BUILD_ENV_TEST_B).toBe('only-in-env');
    } finally {
      await cleanup();
    }
  });

  test('auto-load does not override values already set in process.env', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    await writeFile(join(tmpDir, '.env.local'), 'BUILD_ENV_TEST_A=from-file', 'utf-8');
    process.env.BUILD_ENV_TEST_A = 'from-process';

    try {
      loadBuildEnv({ cwd: tmpDir });

      expect(process.env.BUILD_ENV_TEST_A).toBe('from-process');
    } finally {
      await cleanup();
    }
  });

  test('is a no-op when no env files are present', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    try {
      expect(() => loadBuildEnv({ cwd: tmpDir })).not.toThrow();
      expect(process.env.BUILD_ENV_TEST_A).toBeUndefined();
    } finally {
      await cleanup();
    }
  });
});
