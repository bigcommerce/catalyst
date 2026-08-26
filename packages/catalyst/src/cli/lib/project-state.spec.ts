import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { mkTempDir } from './mk-temp-dir';
import { getProjectState } from './project-state';

let tmpDir: string;
let cleanup: () => Promise<void>;

const writeFileEnsured = async (path: string, contents: string) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
};

const writeProjectJson = (cwd: string, value: unknown) =>
  writeFileEnsured(join(cwd, '.bigcommerce', 'project.json'), JSON.stringify(value));

const writePackageJson = (cwd: string, value: unknown) =>
  writeFileEnsured(join(cwd, 'package.json'), JSON.stringify(value));

beforeEach(async () => {
  [tmpDir, cleanup] = await mkTempDir();
});

afterEach(async () => {
  await cleanup();
});

describe('getProjectState', () => {
  test('empty directory returns all-false flags', () => {
    const state = getProjectState(tmpDir);

    expect(state).toEqual({
      projectUuid: undefined,
      hasMiddleware: false,
      hasProxy: false,
      hasOpenNextDep: false,
      isLinked: false,
      isTransformed: false,
      isFullySetUp: false,
    });
  });

  test('does not create .bigcommerce/ as a side effect', () => {
    getProjectState(tmpDir);

    expect(existsSync(join(tmpDir, '.bigcommerce'))).toBe(false);
  });

  test('isLinked when projectUuid is set', async () => {
    await writeProjectJson(tmpDir, { projectUuid: 'abc-123' });

    const state = getProjectState(tmpDir);

    expect(state.projectUuid).toBe('abc-123');
    expect(state.isLinked).toBe(true);
    expect(state.isTransformed).toBe(false);
    expect(state.isFullySetUp).toBe(false);
  });

  test('malformed project.json is treated as unlinked', async () => {
    await writeFileEnsured(join(tmpDir, '.bigcommerce', 'project.json'), '{not json');

    const state = getProjectState(tmpDir);

    expect(state.projectUuid).toBeUndefined();
    expect(state.isLinked).toBe(false);
  });

  test('hasMiddleware/hasProxy reflect file presence', async () => {
    await writeFileEnsured(join(tmpDir, 'proxy.ts'), '// proxy');

    const before = getProjectState(tmpDir);

    expect(before.hasProxy).toBe(true);
    expect(before.hasMiddleware).toBe(false);

    await writeFileEnsured(join(tmpDir, 'middleware.ts'), '// middleware');

    const after = getProjectState(tmpDir);

    expect(after.hasProxy).toBe(true);
    expect(after.hasMiddleware).toBe(true);
  });

  test('hasOpenNextDep reflects package.json dependencies', async () => {
    await writePackageJson(tmpDir, {
      dependencies: { '@opennextjs/cloudflare': '1.20.3' },
    });

    expect(getProjectState(tmpDir).hasOpenNextDep).toBe(true);
  });

  test('package.json without OpenNext dep returns false', async () => {
    await writePackageJson(tmpDir, { dependencies: { next: '15.0.0' } });

    expect(getProjectState(tmpDir).hasOpenNextDep).toBe(false);
  });

  test('isTransformed requires only the OpenNext dep', async () => {
    await writePackageJson(tmpDir, {
      dependencies: { '@opennextjs/cloudflare': '1.20.3' },
    });

    expect(getProjectState(tmpDir).isTransformed).toBe(true);
  });

  // The rename is gone: @opennextjs/cloudflare 1.20.3 bundles `proxy.ts`
  // natively, so keeping Next 16's own filename is the transformed state.
  test('isTransformed is true with proxy.ts present', async () => {
    await writeFileEnsured(join(tmpDir, 'proxy.ts'), '// proxy');
    await writePackageJson(tmpDir, {
      dependencies: { '@opennextjs/cloudflare': '1.20.3' },
    });

    expect(getProjectState(tmpDir).isTransformed).toBe(true);
  });

  // Projects transformed by a pre-1.20.3 CLI carry the renamed `middleware.ts`.
  // Next still honors that filename, so they stay transformed rather than being
  // dragged back through a migration.
  test('isTransformed is true for a legacy middleware.ts project', async () => {
    await writeFileEnsured(join(tmpDir, 'middleware.ts'), '// middleware');
    await writePackageJson(tmpDir, {
      dependencies: { '@opennextjs/cloudflare': '1.20.3' },
    });

    expect(getProjectState(tmpDir).isTransformed).toBe(true);
  });

  test('isTransformed is false if OpenNext dep missing', async () => {
    await writeFileEnsured(join(tmpDir, 'proxy.ts'), '// proxy');

    expect(getProjectState(tmpDir).isTransformed).toBe(false);
  });

  test('isFullySetUp requires both linked and transformed', async () => {
    await writeProjectJson(tmpDir, { projectUuid: 'abc-123' });
    await writeFileEnsured(join(tmpDir, 'proxy.ts'), '// proxy');
    await writePackageJson(tmpDir, {
      dependencies: { '@opennextjs/cloudflare': '1.20.3' },
    });

    const state = getProjectState(tmpDir);

    expect(state.isLinked).toBe(true);
    expect(state.isTransformed).toBe(true);
    expect(state.isFullySetUp).toBe(true);
  });

  test('linked but untransformed (e.g. after `catalyst projects create` only)', async () => {
    await writeProjectJson(tmpDir, { projectUuid: 'abc-123' });
    await writeFileEnsured(join(tmpDir, 'proxy.ts'), '// proxy');

    const state = getProjectState(tmpDir);

    expect(state.isLinked).toBe(true);
    expect(state.isTransformed).toBe(false);
    expect(state.isFullySetUp).toBe(false);
  });

  test('transformed but unlinked (e.g. mid-setup before UUID is written)', async () => {
    await writeFileEnsured(join(tmpDir, 'proxy.ts'), '// proxy');
    await writePackageJson(tmpDir, {
      dependencies: { '@opennextjs/cloudflare': '1.20.3' },
    });

    const state = getProjectState(tmpDir);

    expect(state.isLinked).toBe(false);
    expect(state.isTransformed).toBe(true);
    expect(state.isFullySetUp).toBe(false);
  });
});
