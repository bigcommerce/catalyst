/**
 * Action-level tests for `catalyst upgrade`. Invokes upgrade.parseAsync() the
 * same way the real CLI does, using process.chdir() to control the working
 * directory. Telemetry, logger output, and spinner animations are mocked.
 * Downloads use the shared CLI cache so subsequent runs are offline.
 */

import { execa } from 'execa';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

// Windows holds git file locks longer than the default 10 s hook timeout.
vi.setConfig({ hookTimeout: 60_000 });

import { downloadCore, parseRef, upgrade } from './upgrade';

vi.mock('../lib/telemetry', () => ({ getTelemetry: () => ({ track: vi.fn() }) }));
vi.mock('../lib/logger', () => ({
  consola: { log: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
vi.mock('yocto-spinner', () => ({
  default: () => ({ start: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }) }),
}));

const REPO = 'bigcommerce/catalyst';
const BASE_REF = '@bigcommerce/catalyst-core@1.6.3';
const TARGET_VERSION = '1.7.0';
const TARGET_REF = `@bigcommerce/catalyst-core@${TARGET_VERSION}`;
const MAKESWIFT_BASE_REF = '@bigcommerce/catalyst-makeswift@1.2.0';
const MAKESWIFT_TARGET_REF = '@bigcommerce/catalyst-makeswift@1.3.0';
// Windows CI runners are ~10× slower than Linux; 120 s is too tight for
// tests that run the full download-and-merge pipeline. 300 s gives plenty
// of headroom even on unusually loaded Windows runners.
const TIMEOUT = 300_000;

const createdDirs: string[] = [];
let originalCwd: string;

// JSON.parse returns `any`; centralise the unsafe-return suppression here.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const parseJson = (raw: string): Record<string, unknown> => JSON.parse(raw);

async function mkTmp(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'upgrade-action-'));

  createdDirs.push(dir);

  return dir;
}

beforeEach(() => {
  originalCwd = process.cwd();
});

afterEach(async () => {
  process.chdir(originalCwd);
  vi.restoreAllMocks();
  await Promise.all(
    createdDirs
      .splice(0)
      .map((d) => rm(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })),
  );
});

async function initGitProject(dir: string): Promise<void> {
  await execa('git', ['init', '-q'], { cwd: dir });
  await execa('git', ['config', 'user.email', 't@t.com'], { cwd: dir });
  await execa('git', ['config', 'user.name', 't'], { cwd: dir });
  await execa('git', ['config', 'commit.gpgsign', 'false'], { cwd: dir });
  await execa('git', ['config', 'gc.auto', '0'], { cwd: dir });
  await execa('git', ['add', '-A'], { cwd: dir });
  await execa('git', ['commit', '-qm', 'base'], { cwd: dir });
}

// Creates and returns a committed project directory seeded from the 1.6.3 tarball.
// Versions <= 1.7.0 predate LTRAC-466 and have no catalyst.ref field in the
// tarball, so we inject it here when withCatalystRef is true so that action
// tests which don't specifically test the missing-ref path don't hit the
// interactive confirm prompt.
async function setup163Project(
  root: string,
  opts: { withCatalystRef?: boolean } = {},
): Promise<string> {
  const { withCatalystRef = true } = opts;
  const baseDir = join(root, 'base');

  await downloadCore(REPO, BASE_REF, baseDir);

  const projectDir = join(root, 'project');

  await cp(baseDir, projectDir, { recursive: true });

  const pkgPath = join(projectDir, 'package.json');
  const pkg = parseJson(await readFile(pkgPath, 'utf-8'));

  if (withCatalystRef) {
    const { version } = parseRef(BASE_REF);

    pkg.catalyst = { version, ref: BASE_REF };
  } else {
    delete pkg.catalyst;
  }

  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  await initGitProject(projectDir);

  return projectDir;
}

// ── Fast tests (no tarball downloads) ────────────────────────────────────────

test('already up to date short-circuits before downloading', async () => {
  const root = await mkTmp();
  const projectDir = join(root, 'project');

  await mkdir(projectDir, { recursive: true });
  await writeFile(
    join(projectDir, 'package.json'),
    `${JSON.stringify(
      {
        name: '@bigcommerce/catalyst-core',
        version: TARGET_VERSION,
        catalyst: { version: TARGET_VERSION, ref: TARGET_REF },
      },
      null,
      2,
    )}\n`,
  );
  await initGitProject(projectDir);
  process.chdir(projectDir);

  // Resolves cleanly — no download, no exit, no file changes.
  await expect(upgrade.parseAsync([TARGET_VERSION], { from: 'user' })).resolves.toBeDefined();

  const status = (await execa('git', ['status', '--porcelain'], { cwd: projectDir })).stdout;

  expect(status.trim()).toBe('');
  // git init + commit on Windows CI takes longer than the 5s default
}, 15_000);

test('dirty worktree: uncommitted changes cause exit(1) before any download', async () => {
  const root = await mkTmp();
  const projectDir = join(root, 'project');

  await mkdir(projectDir, { recursive: true });
  await writeFile(
    join(projectDir, 'package.json'),
    `${JSON.stringify(
      {
        name: '@bigcommerce/catalyst-core',
        version: '1.6.3',
        catalyst: { version: '1.6.3', ref: BASE_REF },
      },
      null,
      2,
    )}\n`,
  );
  await initGitProject(projectDir);

  // Untracked file → dirty tree.
  await writeFile(join(projectDir, 'dirty.ts'), 'export const x = 1;\n');
  process.chdir(projectDir);

  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit');
  });

  await expect(upgrade.parseAsync([TARGET_VERSION], { from: 'user' })).rejects.toThrow();
  expect(exitSpy).toHaveBeenCalledWith(1);
});

test('invalid tag: a nonexistent version surfaces a 404 error', async () => {
  const root = await mkTmp();

  // Test downloadCore directly — the action re-throws this error unchanged.
  await expect(
    downloadCore(REPO, '@bigcommerce/catalyst-core@0.0.1-nonexistent', join(root, 'dest')),
  ).rejects.toThrow(/404.*not found/i);
}, 30_000);

// ── Tests that use real tarballs (cached after first run) ─────────────────────

test(
  '--dry-run prints the diff but leaves the project completely unchanged',
  async () => {
    const root = await mkTmp();
    const projectDir = await setup163Project(root);
    const pkgBefore = await readFile(join(projectDir, 'package.json'), 'utf-8');

    process.chdir(projectDir);

    await upgrade.parseAsync([TARGET_VERSION, '--dry-run'], { from: 'user' });

    // Nothing staged or modified.
    const status = (await execa('git', ['status', '--porcelain'], { cwd: projectDir })).stdout;

    expect(status.trim()).toBe('');
    expect(await readFile(join(projectDir, 'package.json'), 'utf-8')).toBe(pkgBefore);
  },
  TIMEOUT,
);

test(
  'missing catalyst.ref with --yes infers the base and stamps the target ref',
  async () => {
    const root = await mkTmp();
    const projectDir = await setup163Project(root, { withCatalystRef: false });

    process.chdir(projectDir);

    await upgrade.parseAsync([TARGET_VERSION, '--yes'], { from: 'user' });

    const pkg = parseJson(await readFile(join(projectDir, 'package.json'), 'utf-8'));

    expect(pkg.catalyst).toMatchObject({ ref: TARGET_REF });
  },
  TIMEOUT,
);

test(
  'running upgrade from inside core/ resolves to the git root and applies correctly',
  async () => {
    const root = await mkTmp();
    const baseDir = join(root, 'base');

    await downloadCore(REPO, BASE_REF, baseDir);

    // Nested layout: Catalyst package lives under <projectRoot>/core/.
    const projectRoot = join(root, 'project');

    await mkdir(join(projectRoot, 'core'), { recursive: true });
    await cp(baseDir, join(projectRoot, 'core'), { recursive: true });

    // 1.6.3 predates LTRAC-466 — inject catalyst.ref so the action doesn't
    // hit the interactive confirm prompt.
    const corePkgPath = join(projectRoot, 'core', 'package.json');
    const corePkg = parseJson(await readFile(corePkgPath, 'utf-8'));
    const { version: baseVersion } = parseRef(BASE_REF);

    corePkg.catalyst = { version: baseVersion, ref: BASE_REF };
    await writeFile(corePkgPath, `${JSON.stringify(corePkg, null, 2)}\n`);
    await initGitProject(projectRoot);

    // Simulate running `catalyst upgrade` from inside core/.
    process.chdir(join(projectRoot, 'core'));

    await upgrade.parseAsync([TARGET_VERSION], { from: 'user' });

    const pkg = parseJson(await readFile(join(projectRoot, 'core', 'package.json'), 'utf-8'));

    expect(pkg.catalyst).toMatchObject({ ref: TARGET_REF });
  },
  TIMEOUT,
);

test(
  'dirty worktree with --dry-run proceeds without error',
  async () => {
    const root = await mkTmp();
    const projectDir = await setup163Project(root);

    // Staged change — normally blocks the upgrade.
    await writeFile(join(projectDir, 'dirty.ts'), 'export const x = 1;\n');
    process.chdir(projectDir);

    // Should resolve without throwing and leave the tree as-is.
    await expect(
      upgrade.parseAsync([TARGET_VERSION, '--dry-run'], { from: 'user' }),
    ).resolves.toBeDefined();
  },
  TIMEOUT,
);

test(
  'staged-but-uncommitted changes are treated as a dirty worktree and cause exit(1)',
  async () => {
    const root = await mkTmp();
    const projectDir = await setup163Project(root);

    // Stage a new file without committing — this is dirty too.
    await writeFile(join(projectDir, 'staged.ts'), 'export const x = 1;\n');
    await execa('git', ['add', 'staged.ts'], { cwd: projectDir });
    process.chdir(projectDir);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(upgrade.parseAsync([TARGET_VERSION], { from: 'user' })).rejects.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
  },
  TIMEOUT,
);

test(
  '--from overrides base detection when catalyst.ref is missing',
  async () => {
    const root = await mkTmp();
    // Start with a project that has no catalyst.ref — normally triggers the
    // interactive confirm prompt. Passing --from bypasses it entirely.
    const projectDir = await setup163Project(root, { withCatalystRef: false });

    process.chdir(projectDir);

    await upgrade.parseAsync([TARGET_VERSION, '--from', BASE_REF], { from: 'user' });

    const pkg = parseJson(await readFile(join(projectDir, 'package.json'), 'utf-8'));

    expect(pkg.catalyst).toMatchObject({ ref: TARGET_REF });
  },
  TIMEOUT,
);

test(
  '--ref flag upgrades a makeswift integration family project to the target tag',
  async () => {
    const root = await mkTmp();
    const baseDir = join(root, 'base');

    await downloadCore(REPO, MAKESWIFT_BASE_REF, baseDir);

    const projectDir = join(root, 'project');

    await cp(baseDir, projectDir, { recursive: true });

    // makeswift 1.2.0 also predates LTRAC-466 — inject catalyst.ref.
    const pkgPath = join(projectDir, 'package.json');
    const pkg = parseJson(await readFile(pkgPath, 'utf-8'));
    const { version: baseVersion } = parseRef(MAKESWIFT_BASE_REF);

    pkg.catalyst = { version: baseVersion, ref: MAKESWIFT_BASE_REF };
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    await initGitProject(projectDir);

    process.chdir(projectDir);

    await upgrade.parseAsync(['--ref', MAKESWIFT_TARGET_REF], { from: 'user' });

    const updated = parseJson(await readFile(pkgPath, 'utf-8'));

    expect(updated.catalyst).toMatchObject({ ref: MAKESWIFT_TARGET_REF });
  },
  TIMEOUT,
);
