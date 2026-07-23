/**
 * Integration tests for `catalyst upgrade`. These tests download real Catalyst
 * tarballs (using the same cache as the CLI at ~/.cache/catalyst-cli/cores) and
 * run the full upgrade pipeline against them. On first run, tarballs are fetched
 * from GitHub (~3MB each). Subsequent runs use the on-disk cache and run offline.
 */
import { execa } from 'execa';
import { execSync } from 'node:child_process';
import { access, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.setConfig({ hookTimeout: 60_000 });

import {
  applyIndexState,
  computeBaseSimilarity,
  downloadCore,
  mergeCorePerFile,
  mergeCoreTree,
  resolveProject,
} from './upgrade';

const SUPPORTS_TREE = (() => {
  try {
    const match = /(\d+)\.(\d+)/.exec(execSync('git --version').toString());

    return !!match && (Number(match[1]) > 2 || (Number(match[1]) === 2 && Number(match[2]) >= 38));
  } catch {
    return false;
  }
})();

const engines: Array<'per-file' | 'tree'> = SUPPORTS_TREE ? ['per-file', 'tree'] : ['per-file'];

const exists = (p: string) =>
  access(p)
    .then(() => true)
    .catch(() => false);

const createdDirs: string[] = [];

async function mkTmp(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'upgrade-integ-'));

  createdDirs.push(dir);

  return dir;
}

afterEach(async () => {
  await Promise.all(
    createdDirs
      .splice(0)
      .map((d) => rm(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })),
  );
});

const REPO = 'bigcommerce/catalyst';
// Versions used in the manual spike testing — known to have a meaningful diff.
const BASE_REF = '@bigcommerce/catalyst-core@1.6.3';
const TARGET_REF = '@bigcommerce/catalyst-core@1.7.0';

const MAKESWIFT_BASE_REF = '@bigcommerce/catalyst-makeswift@1.2.0';
const MAKESWIFT_TARGET_REF = '@bigcommerce/catalyst-makeswift@1.3.0';

async function fetchTarballs(root: string): Promise<{ baseDir: string; theirsDir: string }> {
  const baseDir = join(root, 'base');
  const theirsDir = join(root, 'theirs');

  await Promise.all([
    downloadCore(REPO, BASE_REF, baseDir),
    downloadCore(REPO, TARGET_REF, theirsDir),
  ]);

  return { baseDir, theirsDir };
}

async function initGitProject(dir: string): Promise<void> {
  await execa('git', ['init', '-q'], { cwd: dir });
  await execa('git', ['config', 'user.email', 't@t.com'], { cwd: dir });
  await execa('git', ['config', 'user.name', 't'], { cwd: dir });
  await execa('git', ['config', 'commit.gpgsign', 'false'], { cwd: dir });
  // Disable auto-gc so git never spawns background pack processes that would
  // still be running when afterEach tries to remove the temp directory.
  await execa('git', ['config', 'gc.auto', '0'], { cwd: dir });
  await execa('git', ['add', '-A'], { cwd: dir });
  await execa('git', ['commit', '-qm', 'base'], { cwd: dir });
}

// 300s per test: Windows CI runners are ~10× slower than Linux, so 120 s
// is too tight for tests that run the full download-and-merge pipeline.
const TIMEOUT = 300_000;

describe.each(engines)('integration (engine: %s)', (engine) => {
  const runMerge = (baseDir: string, theirsDir: string, oursDir: string, emptyFile: string) =>
    engine === 'tree'
      ? mergeCoreTree(baseDir, theirsDir, oursDir)
      : mergeCorePerFile(baseDir, theirsDir, oursDir, emptyFile);

  test(
    'clean project upgrades without conflicts and all changes staged',
    async () => {
      const root = await mkTmp();
      const { baseDir, theirsDir } = await fetchTarballs(root);

      // Project = fresh copy of 1.6.3 with no merchant modifications.
      const oursDir = join(root, 'project');

      await cp(baseDir, oursDir, { recursive: true });
      await initGitProject(oursDir);

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      const result = await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // No merchant customizations → no conflicts.
      expect(result.conflicted).toHaveLength(0);
      // Versions aren't identical, so there must be at least one change.
      expect(result.applied.length + result.added.length + result.deleted.length).toBeGreaterThan(
        0,
      );

      await applyIndexState(oursDir, '.', baseDir, theirsDir, result, false);

      const status = (await execa('git', ['status', '--porcelain'], { cwd: oursDir })).stdout;
      const lines = status.trim().split('\n').filter(Boolean);

      // Every change should be staged (leading column non-space, non-?).
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.every((l) => !l.startsWith(' ') && !l.startsWith('?'))).toBe(true);
    },
    TIMEOUT,
  );

  test(
    'merchant-deleted file that upstream modifies is restored as a conflict',
    async () => {
      const root = await mkTmp();
      const { baseDir, theirsDir } = await fetchTarballs(root);

      // Start from the base version, then delete package.json — a file upstream always
      // modifies (version bump at minimum between 1.6.3 and 1.7.0).
      const oursDir = join(root, 'project');

      await cp(baseDir, oursDir, { recursive: true });
      await rm(join(oursDir, 'package.json'), { force: true });
      await initGitProject(oursDir);

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      const result = await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // modify/delete: upstream's version should be restored and flagged as conflicted.
      expect(result.conflicted).toContain('package.json');
      expect(await exists(join(oursDir, 'package.json'))).toBe(true);
    },
    TIMEOUT,
  );

  test(
    'merchant dep addition in a non-overlapping region is preserved after upgrade',
    async () => {
      const root = await mkTmp();
      const { baseDir, theirsDir } = await fetchTarballs(root);

      const oursDir = join(root, 'project');

      await cp(baseDir, oursDir, { recursive: true });

      const pkgPath = join(oursDir, 'package.json');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const pkg: Record<string, unknown> = JSON.parse(await readFile(pkgPath, 'utf-8'));
      const deps: Record<string, string> = {};

      if (typeof pkg.dependencies === 'object' && pkg.dependencies !== null) {
        Object.assign(deps, pkg.dependencies);
      }

      deps['some-merchant-package'] = '^1.0.0';
      pkg.dependencies = deps;
      await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
      await initGitProject(oursDir);

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // The merchant dep must be present in the merged output — either cleanly
      // applied or in the ours side of any conflict markers.
      const merged = await readFile(pkgPath, 'utf-8');

      expect(merged).toContain('"some-merchant-package"');
    },
    TIMEOUT,
  );

  test(
    're-merging after upgrade with identical base and target produces no changes',
    async () => {
      const root = await mkTmp();
      const { baseDir, theirsDir } = await fetchTarballs(root);

      const oursDir = join(root, 'project');

      await cp(baseDir, oursDir, { recursive: true });
      await initGitProject(oursDir);

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      // First upgrade: base → target (ours now at target state)
      await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // Second "upgrade": target → target (no upstream diff) → nothing to do
      const idempotentResult = await runMerge(theirsDir, theirsDir, oursDir, emptyFile);

      expect(idempotentResult.applied).toHaveLength(0);
      expect(idempotentResult.added).toHaveLength(0);
      expect(idempotentResult.deleted).toHaveLength(0);
      expect(idempotentResult.conflicted).toHaveLength(0);
    },
    TIMEOUT,
  );

  test(
    'flat repo layout — changes land at root and resolveProject detects relDir "."',
    async () => {
      const root = await mkTmp();
      const { baseDir, theirsDir } = await fetchTarballs(root);

      // Flat layout: extract base tarball contents directly to the repo root (no core/ subdir).
      const oursDir = join(root, 'flat-project');

      await cp(baseDir, oursDir, { recursive: true });
      await initGitProject(oursDir);

      // resolveProject must identify this as a flat layout.
      const project = await resolveProject(oursDir);

      expect(project).not.toBeNull();
      expect(project?.relDir).toBe('.');

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      const result = await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // All changed paths should be at the root — no "core/" prefix.
      const allPaths = [
        ...result.applied,
        ...result.added,
        ...result.deleted,
        ...result.conflicted,
      ];

      expect(allPaths.some((p) => p.startsWith('core/'))).toBe(false);

      // No nested core/ directory should have been created inside the flat project.
      expect(await exists(join(oursDir, 'core'))).toBe(false);
    },
    TIMEOUT,
  );

  test(
    'file modified by merchant AND upstream produces conflict markers',
    async () => {
      const root = await mkTmp();
      const { baseDir, theirsDir } = await fetchTarballs(root);

      // Merchant project: start from 1.6.3, then change package.json's version
      // field — the same field that the 1.6.3 → 1.7.0 diff also touches.
      const oursDir = join(root, 'project');

      await cp(baseDir, oursDir, { recursive: true });

      const pkgPath = join(oursDir, 'package.json');
      const raw = await readFile(pkgPath, 'utf-8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const pkg: Record<string, unknown> = JSON.parse(raw);

      pkg.version = 'custom-merchant-version'; // overlaps with upstream's version bump
      await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
      await initGitProject(oursDir);

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      const result = await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // package.json was modified by both sides → must be conflicted.
      expect(result.conflicted).toContain('package.json');

      // Confirm the file contains conflict markers.
      const merged = await readFile(join(oursDir, 'package.json'), 'utf-8');

      expect(merged).toContain('<<<<<<< ours');
      expect(merged).toContain('>>>>>>> theirs');
    },
    TIMEOUT,
  );
});

describe.each(engines)('integration makeswift family (engine: %s)', (engine) => {
  const runMerge = (baseDir: string, theirsDir: string, oursDir: string, emptyFile: string) =>
    engine === 'tree'
      ? mergeCoreTree(baseDir, theirsDir, oursDir)
      : mergeCorePerFile(baseDir, theirsDir, oursDir, emptyFile);

  test(
    'clean makeswift project (1.2.0 → 1.3.0) upgrades without conflicts',
    async () => {
      const root = await mkTmp();
      const baseDir = join(root, 'base');
      const theirsDir = join(root, 'theirs');

      await Promise.all([
        downloadCore(REPO, MAKESWIFT_BASE_REF, baseDir),
        downloadCore(REPO, MAKESWIFT_TARGET_REF, theirsDir),
      ]);

      const oursDir = join(root, 'project');

      await cp(baseDir, oursDir, { recursive: true });
      await execa('git', ['init', '-q'], { cwd: oursDir });
      await execa('git', ['config', 'user.email', 't@t.com'], { cwd: oursDir });
      await execa('git', ['config', 'user.name', 't'], { cwd: oursDir });
      await execa('git', ['config', 'commit.gpgsign', 'false'], { cwd: oursDir });
      await execa('git', ['add', '-A'], { cwd: oursDir });
      await execa('git', ['commit', '-qm', 'base'], { cwd: oursDir });

      const emptyFile = join(root, '.empty');

      await writeFile(emptyFile, '');

      const result = await runMerge(baseDir, theirsDir, oursDir, emptyFile);

      // A clean makeswift project should merge without conflicts.
      expect(result.conflicted).toHaveLength(0);
      expect(result.applied.length + result.added.length + result.deleted.length).toBeGreaterThan(
        0,
      );
    },
    TIMEOUT,
  );

  test(
    'computeBaseSimilarity scores higher for the correct makeswift base than a wrong base',
    async () => {
      const root = await mkTmp();
      const baseDir = join(root, 'base');
      const theirsDir = join(root, 'theirs');

      await Promise.all([
        downloadCore(REPO, MAKESWIFT_BASE_REF, baseDir),
        downloadCore(REPO, MAKESWIFT_TARGET_REF, theirsDir),
      ]);

      // "Project" = clean makeswift 1.2.0 (no modifications).
      const projectDir = join(root, 'project');

      await cp(baseDir, projectDir, { recursive: true });

      // Correct base scores near-perfect (project is an unmodified 1.2.0 copy).
      const correctScore = await computeBaseSimilarity(baseDir, projectDir);
      // Wrong base (1.3.0) scores lower because files changed between versions.
      const wrongScore = await computeBaseSimilarity(theirsDir, projectDir);

      expect(correctScore).toBeGreaterThan(0.9);
      expect(wrongScore).toBeLessThan(correctScore);
    },
    TIMEOUT,
  );
});

test(
  'computeBaseSimilarity: correct base scores higher than a wrong base',
  async () => {
    const root = await mkTmp();
    const { baseDir, theirsDir } = await fetchTarballs(root);

    // "Project" = clean 1.6.3 (no merchant modifications).
    const projectDir = join(root, 'project');

    await cp(baseDir, projectDir, { recursive: true });

    // Correct base (1.6.3 vs a fresh 1.6.3 project) → near-perfect similarity.
    const correctScore = await computeBaseSimilarity(baseDir, projectDir);

    // Wrong base (1.7.0 vs the same 1.6.3 project) → lower similarity.
    const wrongScore = await computeBaseSimilarity(theirsDir, projectDir);

    expect(correctScore).toBeGreaterThan(0.9);
    expect(wrongScore).toBeLessThan(correctScore);
  },
  TIMEOUT,
);
