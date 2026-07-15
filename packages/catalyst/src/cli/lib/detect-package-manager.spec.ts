import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectPackageManager as detectFromDir } from 'nypm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { detectProjectPackageManager } from './detect-package-manager';

// nypm's own fallback sniffs process.argv[1] for a package manager's name, which
// spuriously matches 'pnpm' in this pnpm-managed monorepo (test runner path
// contains `.pnpm`). Spy on it so the "nothing detectable" case below tests our
// fallback instead of that environment artifact.
vi.mock('nypm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('nypm')>();

  return { ...actual, detectPackageManager: vi.fn(actual.detectPackageManager) };
});

let projectDir: string;

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'catalyst-detect-pm-'));
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

describe('detectProjectPackageManager', () => {
  it('detects pnpm from a pnpm-lock.yaml', async () => {
    writeFileSync(join(projectDir, 'pnpm-lock.yaml'), '');

    await expect(detectProjectPackageManager(projectDir)).resolves.toBe('pnpm');
  });

  it('detects npm from a package-lock.json', async () => {
    writeFileSync(join(projectDir, 'package-lock.json'), '{}');

    await expect(detectProjectPackageManager(projectDir)).resolves.toBe('npm');
  });

  it('detects yarn from a yarn.lock', async () => {
    writeFileSync(join(projectDir, 'yarn.lock'), '');

    await expect(detectProjectPackageManager(projectDir)).resolves.toBe('yarn');
  });

  it('detects bun from a bun.lock', async () => {
    writeFileSync(join(projectDir, 'bun.lock'), '');

    await expect(detectProjectPackageManager(projectDir)).resolves.toBe('bun');
  });

  it('honors the package.json packageManager field', async () => {
    writeFileSync(
      join(projectDir, 'package.json'),
      JSON.stringify({ packageManager: 'yarn@4.0.0' }),
    );

    await expect(detectProjectPackageManager(projectDir)).resolves.toBe('yarn');
  });

  it('falls back to npm when nothing is detectable', async () => {
    vi.mocked(detectFromDir).mockResolvedValueOnce(undefined);

    await expect(detectProjectPackageManager(projectDir)).resolves.toBe('npm');
  });
});
