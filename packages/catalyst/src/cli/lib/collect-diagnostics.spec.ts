import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import PACKAGE_INFO from '../../../package.json';

import { collectDiagnostics, REPORTED_ENV_VARS } from './collect-diagnostics';
import { mkTempDir } from './mk-temp-dir';

vi.mock('./telemetry', () => ({
  getTelemetry: () => ({
    correlationId: 'test-session-uuid',
    isEnabled: () => false,
  }),
}));

let tmpDir: string;
let cleanup: () => Promise<void>;

const writeFileEnsured = async (path: string, contents: string) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
};

const writeProjectJson = (cwd: string, value: unknown) =>
  writeFileEnsured(join(cwd, '.bigcommerce', 'project.json'), JSON.stringify(value));

const emptyEnv: NodeJS.ProcessEnv = {};

beforeEach(async () => {
  [tmpDir, cleanup] = await mkTempDir();
});

afterEach(async () => {
  await cleanup();
});

describe('collectDiagnostics', () => {
  test('reports CLI, runtime, and telemetry basics', () => {
    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.cli.name).toBe('@bigcommerce/catalyst');
    expect(d.cli.version).toBe(PACKAGE_INFO.version);
    expect(d.runtime.node).toBe(process.version);
    expect(d.runtime.platform).toBe(process.platform);
    expect(d.runtime.arch).toBe(process.arch);
    expect(typeof d.runtime.osRelease).toBe('string');
    expect(['npm', 'pnpm', 'yarn', 'bun']).toContain(d.runtime.packageManager);
    // Telemetry is stubbed by the global test setup.
    expect(d.telemetry.correlationId).toBe('test-session-uuid');
    expect(typeof d.telemetry.enabled).toBe('boolean');
  });

  test('empty project: everything unset/absent', () => {
    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.project).toEqual({
      cwd: tmpDir,
      projectUuid: null,
      isLinked: false,
      isTransformed: false,
      isFullySetUp: false,
      hasMiddleware: false,
      hasProxy: false,
      hasOpenNextDep: false,
    });
    expect(d.config.storeHash).toEqual({ present: false, source: 'unset' });
    expect(d.config.accessToken).toEqual({ present: false, source: 'unset' });
    expect(d.config.projectUuid).toEqual({ present: false, source: 'unset' });
    expect(d.config.projectJsonKeys).toEqual([]);
    expect(d.config.storedEnvKeys).toEqual([]);
    expect(Object.values(d.config.envVars).every((v) => !v)).toBe(true);
    expect(Object.keys(d.config.envVars)).toEqual([...REPORTED_ENV_VARS]);
    expect(d.files).toEqual({
      '.env.local': false,
      '.env': false,
      '.bigcommerce/project.json': false,
      '.bigcommerce/wrangler.jsonc': false,
      '.open-next/': false,
      'package.json': false,
    });
  });

  test('config resolves from project.json, listing keys without values', async () => {
    await writeProjectJson(tmpDir, {
      projectUuid: 'uuid-from-file',
      framework: 'catalyst',
      storeHash: 'store-secret',
      accessToken: 'token-secret',
      env: { ZEBRA: 'z', ALPHA: 'a' },
    });

    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.project.projectUuid).toBe('uuid-from-file');
    expect(d.config.storeHash).toEqual({ present: true, source: 'project.json' });
    expect(d.config.accessToken).toEqual({ present: true, source: 'project.json' });
    expect(d.config.projectUuid).toEqual({ present: true, source: 'project.json' });
    expect(d.config.projectJsonKeys).toEqual([
      'accessToken',
      'env',
      'framework',
      'projectUuid',
      'storeHash',
    ]);
    // Sorted, keys only.
    expect(d.config.storedEnvKeys).toEqual(['ALPHA', 'ZEBRA']);
  });

  test('process.env wins over project.json for resolved source', async () => {
    await writeProjectJson(tmpDir, {
      storeHash: 'store-from-file',
      accessToken: 'token-from-file',
      projectUuid: 'uuid-from-file',
    });

    const d = collectDiagnostics({
      cwd: tmpDir,
      env: {
        CATALYST_STORE_HASH: 'store-from-env',
        CATALYST_ACCESS_TOKEN: 'token-from-env',
        CATALYST_PROJECT_UUID: 'uuid-from-env',
      },
    });

    expect(d.config.storeHash).toEqual({ present: true, source: 'process.env' });
    expect(d.config.accessToken).toEqual({ present: true, source: 'process.env' });
    expect(d.config.projectUuid).toEqual({ present: true, source: 'process.env' });
  });

  test('store hash falls back to the BIGCOMMERCE_STORE_HASH alias', () => {
    const d = collectDiagnostics({
      cwd: tmpDir,
      env: { BIGCOMMERCE_STORE_HASH: 'aliased-store' },
    });

    expect(d.config.storeHash).toEqual({ present: true, source: 'process.env' });
  });

  test('whitespace-only values are treated as unset', () => {
    const d = collectDiagnostics({
      cwd: tmpDir,
      env: { CATALYST_STORE_HASH: '   ', AUTH_SECRET: '\t' },
    });

    expect(d.config.storeHash).toEqual({ present: false, source: 'unset' });
    expect(d.config.envVars.AUTH_SECRET).toBe(false);
  });

  test('reports each env var by presence only', () => {
    const d = collectDiagnostics({
      cwd: tmpDir,
      env: { AUTH_SECRET: 'super-secret', BIGCOMMERCE_CHANNEL_ID: '1' },
    });

    expect(d.config.envVars.AUTH_SECRET).toBe(true);
    expect(d.config.envVars.BIGCOMMERCE_CHANNEL_ID).toBe(true);
    expect(d.config.envVars.BIGCOMMERCE_LOGIN_URL).toBe(false);
  });

  test('detects present files and directories', async () => {
    await writeFileEnsured(join(tmpDir, '.env.local'), 'X=1');
    await writeFileEnsured(join(tmpDir, '.env'), 'X=1');
    await writeProjectJson(tmpDir, { projectUuid: 'x' });
    await writeFileEnsured(join(tmpDir, '.bigcommerce', 'wrangler.jsonc'), '{}');
    await mkdir(join(tmpDir, '.open-next'), { recursive: true });
    await writeFileEnsured(join(tmpDir, 'package.json'), '{}');

    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.files).toEqual({
      '.env.local': true,
      '.env': true,
      '.bigcommerce/project.json': true,
      '.bigcommerce/wrangler.jsonc': true,
      '.open-next/': true,
      'package.json': true,
    });
  });

  test('non-string credential values in project.json are ignored', async () => {
    await writeProjectJson(tmpDir, { storeHash: 123, accessToken: { nested: true } });

    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.config.storeHash).toEqual({ present: false, source: 'unset' });
    expect(d.config.accessToken).toEqual({ present: false, source: 'unset' });
    // The keys are still reported as present, just without their values.
    expect(d.config.projectJsonKeys).toEqual(['accessToken', 'storeHash']);
  });

  test.each([
    ['malformed JSON', 'not json{'],
    ['top-level null', 'null'],
    ['top-level string', '"just a string"'],
    ['top-level array', '[]'],
  ])('treats %s in project.json as no config', async (_label, contents) => {
    await writeFileEnsured(join(tmpDir, '.bigcommerce', 'project.json'), contents);

    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.config.projectJsonKeys).toEqual([]);
    expect(d.config.storedEnvKeys).toEqual([]);
    expect(d.config.storeHash).toEqual({ present: false, source: 'unset' });
  });

  test.each([
    ['non-object env', { env: 'nope' }],
    ['null env', { env: null }],
    ['array env', { env: [] }],
    ['missing env', { projectUuid: 'x' }],
  ])('storedEnvKeys is empty when project.json has %s', async (_label, value) => {
    await writeProjectJson(tmpDir, value);

    const d = collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(d.config.storedEnvKeys).toEqual([]);
  });

  test('does not create .bigcommerce/ as a side effect', () => {
    collectDiagnostics({ cwd: tmpDir, env: emptyEnv });

    expect(existsSync(join(tmpDir, '.bigcommerce'))).toBe(false);
  });

  test('defaults cwd and env to process values', () => {
    // Exercises the default-parameter path (no options passed).
    const d = collectDiagnostics();

    expect(d.project.cwd).toBe(process.cwd());
    expect(d.cli.name).toBe('@bigcommerce/catalyst');
  });

  describe('secret-masking guarantee', () => {
    test('no secret value appears anywhere in the report', async () => {
      const secrets = {
        storeHash: 'STORE_HASH_SECRET_VALUE',
        accessToken: 'ACCESS_TOKEN_SECRET_VALUE',
        env: {
          STOREFRONT_TOKEN: 'STOREFRONT_TOKEN_SECRET_VALUE',
          DB_PASSWORD: 'DB_PASSWORD_SECRET_VALUE',
        },
      };

      await writeProjectJson(tmpDir, { projectUuid: 'uuid-x', framework: 'catalyst', ...secrets });

      const env: NodeJS.ProcessEnv = {
        CATALYST_STORE_HASH: 'ENV_STORE_HASH_SECRET',
        CATALYST_ACCESS_TOKEN: 'ENV_ACCESS_TOKEN_SECRET',
        BIGCOMMERCE_STOREFRONT_TOKEN: 'ENV_STOREFRONT_TOKEN_SECRET',
        AUTH_SECRET: 'ENV_AUTH_SECRET_VALUE',
      };

      const serialized = JSON.stringify(collectDiagnostics({ cwd: tmpDir, env }));

      const leaked = [
        secrets.storeHash,
        secrets.accessToken,
        secrets.env.STOREFRONT_TOKEN,
        secrets.env.DB_PASSWORD,
        env.CATALYST_STORE_HASH,
        env.CATALYST_ACCESS_TOKEN,
        env.BIGCOMMERCE_STOREFRONT_TOKEN,
        env.AUTH_SECRET,
      ];

      leaked.forEach((value) => {
        expect(serialized).not.toContain(value);
      });

      // Key names (not values) are still surfaced so support knows what's set.
      expect(serialized).toContain('STOREFRONT_TOKEN');
      expect(serialized).toContain('DB_PASSWORD');
    });
  });
});
