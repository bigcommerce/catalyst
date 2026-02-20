import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { rootCommand } from './commands/root';
import { loadEnvFile } from './lib/load-env-file';
import { mkTempDir } from './lib/mk-temp-dir';

describe('CLI program', () => {
  test('root command is defined', () => {
    expect(rootCommand).toBeDefined();
  });
});

describe('--env-path option', () => {
  afterEach(() => {
    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;
  });

  test('loads environment variables from file when --env-path points to existing file', async () => {
    const [tmpDir, cleanup] = await mkTempDir('catalyst-env-path-');
    const envPath = join(tmpDir, '.env');

    await writeFile(
      envPath,
      'CATALYST_STORE_HASH=test-store-hash\nCATALYST_ACCESS_TOKEN=test-access-token',
      'utf-8',
    );

    try {
      loadEnvFile(['--env-path', envPath]);

      expect(process.env.CATALYST_STORE_HASH).toBe('test-store-hash');
      expect(process.env.CATALYST_ACCESS_TOKEN).toBe('test-access-token');
    } finally {
      await cleanup();
    }
  });

  test('loads environment variables when --env-path is relative to cwd', async () => {
    const [tmpDir, cleanup] = await mkTempDir('catalyst-env-path-');
    const envFileName = '.env.catalyst-test';
    const envPath = join(tmpDir, envFileName);

    await writeFile(
      envPath,
      'CATALYST_STORE_HASH=test-store-hash\nCATALYST_ACCESS_TOKEN=test-access-token',
      'utf-8',
    );

    const originalCwd = process.cwd();

    process.chdir(tmpDir);

    try {
      loadEnvFile(['--env-path', envFileName]);

      expect(process.env.CATALYST_STORE_HASH).toBe('test-store-hash');
      expect(process.env.CATALYST_ACCESS_TOKEN).toBe('test-access-token');
    } finally {
      process.chdir(originalCwd);
      await cleanup();
    }
  });

  test('throws when --env-path points to non-existent file', async () => {
    const [tmpDir, cleanup] = await mkTempDir('catalyst-env-path-');
    const nonExistentPath = join(tmpDir, '.env.missing');

    try {
      expect(() => loadEnvFile(['--env-path', nonExistentPath])).toThrow(/Env file not found/);
    } finally {
      await cleanup();
    }
  });

  test('returns argv without --env-path when flag is present', async () => {
    const [tmpDir, cleanup] = await mkTempDir('catalyst-env-path-');
    const envPath = join(tmpDir, '.env');

    await writeFile(envPath, 'FOO=bar', 'utf-8');

    try {
      const result = loadEnvFile(['node', 'cli', '--env-path', envPath, 'deploy']);

      expect(result).toEqual(['node', 'cli', 'deploy']);
    } finally {
      delete process.env.FOO;
      await cleanup();
    }
  });

  test('returns argv unchanged when --env-path is not present', () => {
    const argv = ['node', 'cli', 'deploy', '--store-hash', 'abc123'];
    const result = loadEnvFile(argv);

    expect(result).toEqual(argv);
  });
});
