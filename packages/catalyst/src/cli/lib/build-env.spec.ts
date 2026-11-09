import { Command, Option } from 'commander';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import {
  aliasStoreHash,
  applyEnvFileOptions,
  loadBuildEnv,
  readBuildEnv,
  storeHashAlias,
} from './build-env';
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

describe('readBuildEnv', () => {
  afterEach(() => {
    delete process.env.READ_ENV_TEST;
    delete process.env.READ_ENV_REF;
  });

  test('lets an explicit --env-path override the shell, without touching process.env', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    process.env.READ_ENV_TEST = 'from-shell';

    try {
      await writeFile(join(tmpDir, '.env.staging'), 'READ_ENV_TEST=from-file', 'utf-8');

      expect(readBuildEnv({ envPath: '.env.staging', cwd: tmpDir }).READ_ENV_TEST).toBe(
        'from-file',
      );
      expect(process.env.READ_ENV_TEST).toBe('from-shell');
    } finally {
      await cleanup();
    }
  });

  test('keeps the shell over auto-loaded files, and .env.local over .env', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    process.env.READ_ENV_TEST = 'from-shell';

    try {
      await writeFile(join(tmpDir, '.env'), 'READ_ENV_TEST=env\nREAD_ENV_REF=env', 'utf-8');
      await writeFile(join(tmpDir, '.env.local'), 'READ_ENV_REF=local', 'utf-8');

      expect(readBuildEnv({ cwd: tmpDir })).toMatchObject({
        READ_ENV_TEST: 'from-shell',
        READ_ENV_REF: 'local',
      });
      expect(process.env.READ_ENV_REF).toBeUndefined();
    } finally {
      await cleanup();
    }
  });

  test('expands references in auto-loaded files', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    try {
      await writeFile(
        join(tmpDir, '.env.local'),
        'READ_ENV_REF=abc\nREAD_ENV_TEST=$READ_ENV_REF',
        'utf-8',
      );

      expect(readBuildEnv({ cwd: tmpDir }).READ_ENV_TEST).toBe('abc');
    } finally {
      await cleanup();
    }
  });

  test('prefers a defined reference over its default, like loadBuildEnv', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    process.env.READ_ENV_REF = 'target';

    try {
      await writeFile(
        join(tmpDir, '.env.staging'),
        // eslint-disable-next-line no-template-curly-in-string
        'READ_ENV_TEST=${READ_ENV_REF:-fallback}',
        'utf-8',
      );

      expect(readBuildEnv({ envPath: '.env.staging', cwd: tmpDir }).READ_ENV_TEST).toBe('target');
      expect(process.env.READ_ENV_TEST).toBeUndefined();
    } finally {
      await cleanup();
    }
  });

  test("follows the file's BIGCOMMERCE_STORE_HASH over an aliased shell store hash", async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    process.env.BIGCOMMERCE_STORE_HASH = 'old';
    aliasStoreHash();

    try {
      await writeFile(join(tmpDir, '.env.staging'), 'BIGCOMMERCE_STORE_HASH=new', 'utf-8');

      expect(readBuildEnv({ envPath: '.env.staging', cwd: tmpDir }).CATALYST_STORE_HASH).toBe(
        'new',
      );
      expect(process.env.CATALYST_STORE_HASH).toBe('old');
    } finally {
      delete process.env.BIGCOMMERCE_STORE_HASH;
      delete process.env.CATALYST_STORE_HASH;
      storeHashAlias.applied = false;
      await cleanup();
    }
  });

  test('keeps an explicit shell CATALYST_STORE_HASH, even when it matches', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    process.env.BIGCOMMERCE_STORE_HASH = 'explicit';
    process.env.CATALYST_STORE_HASH = 'explicit';

    try {
      await writeFile(join(tmpDir, '.env.staging'), 'BIGCOMMERCE_STORE_HASH=new', 'utf-8');

      expect(readBuildEnv({ envPath: '.env.staging', cwd: tmpDir }).CATALYST_STORE_HASH).toBe(
        'explicit',
      );
    } finally {
      delete process.env.BIGCOMMERCE_STORE_HASH;
      delete process.env.CATALYST_STORE_HASH;
      await cleanup();
    }
  });

  test('uses the default for a self-reference missing from the shell', async () => {
    const [tmpDir, cleanup] = await mkTempDir('build-env-');

    try {
      await writeFile(
        join(tmpDir, '.env.local'),
        // eslint-disable-next-line no-template-curly-in-string
        'READ_ENV_TEST=${READ_ENV_TEST:-fallback}',
        'utf-8',
      );

      expect(readBuildEnv({ cwd: tmpDir }).READ_ENV_TEST).toBe('fallback');
    } finally {
      await cleanup();
    }
  });

  test('throws a UserActionableError when --env-path does not exist', () => {
    expect(() => readBuildEnv({ envPath: '.env.missing', cwd: '/nonexistent' })).toThrow(
      UserActionableError,
    );
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
  });

  test('applies values from the env file', async () => {
    const command = makeCommand();

    await command.parseAsync([], { from: 'user' });
    applyEnvFileOptions(command, { CATALYST_PROJECT_UUID: 'from-file' });

    expect(command.opts()).toEqual({ projectUuid: 'from-file' });
  });

  test('replaces a shell value Commander already applied', async () => {
    process.env.CATALYST_PROJECT_UUID = 'from-shell';

    const command = makeCommand();

    await command.parseAsync([], { from: 'user' });
    applyEnvFileOptions(command, { CATALYST_PROJECT_UUID: 'from-file' });

    expect(command.opts().projectUuid).toBe('from-file');
  });

  test('keeps a value passed as a flag', async () => {
    const command = makeCommand();

    await command.parseAsync(['--project-uuid', 'from-flag'], { from: 'user' });
    applyEnvFileOptions(command, { CATALYST_PROJECT_UUID: 'from-file' });

    expect(command.opts().projectUuid).toBe('from-flag');
  });
});
