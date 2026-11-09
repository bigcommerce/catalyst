import { Command, Option } from 'commander';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { applyEnvFileOptions, loadBuildEnv } from './build-env';
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
      expect(loadBuildEnv({ envPath: '.env.custom', cwd: tmpDir })).toEqual({
        BUILD_ENV_TEST_A: 'from-file',
      });
      expect(process.env.BUILD_ENV_TEST_A).toBe('from-file');
    } finally {
      await cleanup();
    }
  });

  test('expands variable references in an explicit --env-path', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    await writeFile(
      join(tmpDir, '.env.custom'),
      'BUILD_ENV_TEST_A=cdn.example.com\nBUILD_ENV_TEST_B=https://$BUILD_ENV_TEST_A',
      'utf-8',
    );

    try {
      expect(loadBuildEnv({ envPath: '.env.custom', cwd: tmpDir })).toEqual({
        BUILD_ENV_TEST_A: 'cdn.example.com',
        BUILD_ENV_TEST_B: 'https://cdn.example.com',
      });
      expect(process.env.BUILD_ENV_TEST_B).toBe('https://cdn.example.com');
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
      expect(loadBuildEnv({ cwd: tmpDir })).toBeUndefined();
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

describe('applyEnvFileOptions', () => {
  const makeCommand = () =>
    new Command('test')
      .exitOverride()
      .addOption(new Option('--project-uuid <uuid>').env('CATALYST_PROJECT_UUID'))
      .addOption(new Option('--store-hash <hash>').env('CATALYST_STORE_HASH'))
      .option('--other <value>')
      .action(() => undefined);

  afterEach(() => {
    delete process.env.CATALYST_PROJECT_UUID;
    delete process.env.CATALYST_STORE_HASH;
    delete process.env.BIGCOMMERCE_STORE_HASH;
  });

  test('applies env values loaded after parsing', async () => {
    const command = makeCommand();

    await command.parseAsync([], { from: 'user' });
    process.env.CATALYST_PROJECT_UUID = 'from-file';
    applyEnvFileOptions(command);

    expect(command.opts()).toEqual({ projectUuid: 'from-file' });
  });

  test('replaces a shell value Commander already applied', async () => {
    process.env.CATALYST_PROJECT_UUID = 'from-shell';

    const command = makeCommand();

    await command.parseAsync([], { from: 'user' });
    process.env.CATALYST_PROJECT_UUID = 'from-file';
    applyEnvFileOptions(command);

    expect(command.opts().projectUuid).toBe('from-file');
  });

  test('keeps a value passed as a flag', async () => {
    const command = makeCommand();

    await command.parseAsync(['--project-uuid', 'from-flag'], { from: 'user' });
    process.env.CATALYST_PROJECT_UUID = 'from-file';
    applyEnvFileOptions(command);

    expect(command.opts().projectUuid).toBe('from-flag');
  });

  test('falls back to BIGCOMMERCE_STORE_HASH for the store hash', async () => {
    const command = makeCommand();

    await command.parseAsync([], { from: 'user' });
    process.env.BIGCOMMERCE_STORE_HASH = 'from-file';
    applyEnvFileOptions(command);

    expect(command.opts().storeHash).toBe('from-file');
  });
});
