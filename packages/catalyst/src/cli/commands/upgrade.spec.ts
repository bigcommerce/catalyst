import { execa } from 'execa';
import { execSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import {
  applyIndexState,
  computeBaseSimilarity,
  mergeCorePerFile,
  mergeCoreTree,
  parseRef,
  resolveBaseRef,
  resolveProject,
  resolveStrategy,
} from './upgrade';

const createdDirs: string[] = [];

async function mkTmp(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'upgrade-spec-'));

  createdDirs.push(dir);

  return dir;
}

async function write(file: string, content: string | Buffer): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

const exists = (p: string) =>
  access(p)
    .then(() => true)
    .catch(() => false);

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('parseRef', () => {
  test('splits a scoped package ref on the last @', () => {
    expect(parseRef('@bigcommerce/catalyst-core@1.7.0')).toEqual({
      packageName: '@bigcommerce/catalyst-core',
      version: '1.7.0',
    });
  });

  test('handles integration families', () => {
    expect(parseRef('@bigcommerce/catalyst-makeswift@1.7.0')).toEqual({
      packageName: '@bigcommerce/catalyst-makeswift',
      version: '1.7.0',
    });
  });

  test('throws when there is no version separator', () => {
    expect(() => parseRef('catalyst-core')).toThrow();
  });
});

describe('resolveProject', () => {
  async function initRepo(): Promise<string> {
    const repo = await mkTmp();

    await execa('git', ['init', '-q'], { cwd: repo });
    await execa('git', ['config', 'user.email', 't@t.com'], { cwd: repo });
    await execa('git', ['config', 'user.name', 't'], { cwd: repo });

    return repo;
  }

  const catalystPkg = (version: string) =>
    `${JSON.stringify(
      {
        name: '@bigcommerce/catalyst-core',
        version,
        catalyst: { version, ref: `@bigcommerce/catalyst-core@${version}` },
      },
      null,
      2,
    )}\n`;

  test('detects a nested (monorepo) layout → relDir "core"', async () => {
    const repo = await initRepo();

    await write(join(repo, 'core', 'package.json'), catalystPkg('1.6.3'));

    const project = await resolveProject(repo);

    expect(project).not.toBeNull();
    expect(project?.relDir).toBe('core');
    expect(project?.catalystRoot.endsWith('core')).toBe(true);
    expect(project?.pkg.catalyst?.ref).toBe('@bigcommerce/catalyst-core@1.6.3');
  });

  test('detects a flat layout → relDir "."', async () => {
    const repo = await initRepo();

    await write(join(repo, 'package.json'), catalystPkg('1.7.0'));

    const project = await resolveProject(repo);

    expect(project).not.toBeNull();
    expect(project?.relDir).toBe('.');
    expect(project?.pkg.catalyst?.ref).toBe('@bigcommerce/catalyst-core@1.7.0');
  });

  test('returns null outside a git repo', async () => {
    const notARepo = await mkTmp();

    expect(await resolveProject(notARepo)).toBeNull();
  });
});

describe('resolveBaseRef', () => {
  // Minimal Project stub — resolveBaseRef only reads `.pkg` (plus its --from /
  // --yes args). Conditional spreads keep optional fields truly absent so the
  // stub satisfies CorePackageJson under exactOptionalPropertyTypes.
  const projectWith = (pkg: { name?: string; version: string; ref?: string }) => ({
    gitRoot: '/repo',
    catalystRoot: '/repo/core',
    relDir: 'core',
    pkgPath: '/repo/core/package.json',
    rawContent: '',
    pkg: {
      ...(pkg.name === undefined ? {} : { name: pkg.name }),
      version: pkg.version,
      ...(pkg.ref === undefined ? {} : { catalyst: { version: pkg.version, ref: pkg.ref } }),
    },
  });

  test('uses catalyst.ref verbatim when present (ignores --from)', async () => {
    expect(
      await resolveBaseRef(
        projectWith({
          name: '@bigcommerce/catalyst-core',
          version: '1.6.3',
          ref: '@bigcommerce/catalyst-core@1.6.3',
        }),
        '@bigcommerce/catalyst-core@1.0.0',
        false,
      ),
    ).toBe('@bigcommerce/catalyst-core@1.6.3');
  });

  test('missing catalyst.ref: --from wins when provided', async () => {
    expect(
      await resolveBaseRef(
        projectWith({ name: '@bigcommerce/catalyst-core', version: '1.6.3' }),
        '@bigcommerce/catalyst-makeswift@1.5.0',
        false,
      ),
    ).toBe('@bigcommerce/catalyst-makeswift@1.5.0');
  });

  test('missing catalyst.ref (pre-LTRAC-466): infers <name>@<version> under --yes', async () => {
    expect(
      await resolveBaseRef(
        projectWith({ name: '@bigcommerce/catalyst-makeswift', version: '1.6.3' }),
        undefined,
        true,
      ),
    ).toBe('@bigcommerce/catalyst-makeswift@1.6.3');
  });

  test('missing catalyst.ref + unknown package name: defaults to catalyst-core family', async () => {
    expect(
      await resolveBaseRef(
        projectWith({ name: 'acme-storefront', version: '1.6.3' }),
        undefined,
        true,
      ),
    ).toBe('@bigcommerce/catalyst-core@1.6.3');
  });
});

describe('computeBaseSimilarity', () => {
  test('returns 1.0 when all base files match exactly', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'a.txt'), 'hello\n'),
      write(join(root, 'base', 'b.txt'), 'world\n'),
      write(join(root, 'dest', 'a.txt'), 'hello\n'),
      write(join(root, 'dest', 'b.txt'), 'world\n'),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(1.0);
  });

  test('returns 0.5 when half the base files match', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'match.txt'), 'same\n'),
      write(join(root, 'base', 'differ.txt'), 'original\n'),
      write(join(root, 'dest', 'match.txt'), 'same\n'),
      write(join(root, 'dest', 'differ.txt'), 'modified\n'),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(0.5);
  });

  test('returns 0 when no base files exist in dest', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'a.txt'), 'content\n'),
      mkdir(join(root, 'dest'), { recursive: true }),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(0);
  });

  test('returns 0 for an empty base', async () => {
    const root = await mkTmp();

    await Promise.all([
      mkdir(join(root, 'base'), { recursive: true }),
      mkdir(join(root, 'dest'), { recursive: true }),
    ]);

    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(0);
  });

  test('extra files in dest do not affect the score (only base coverage counts)', async () => {
    const root = await mkTmp();

    await Promise.all([
      write(join(root, 'base', 'a.txt'), 'content\n'),
      write(join(root, 'dest', 'a.txt'), 'content\n'),
      write(join(root, 'dest', 'extra.txt'), 'merchant addition\n'),
    ]);

    // 1 base file, 1 match → 1.0 regardless of extra dest files
    expect(await computeBaseSimilarity(join(root, 'base'), join(root, 'dest'))).toBe(1.0);
  });
});

// merge-tree --write-tree (the whole-tree engine) needs git >= 2.38. Gate its
// tests so they're skipped rather than failing on an older git.
const SUPPORTS_TREE = (() => {
  try {
    const match = /(\d+)\.(\d+)/.exec(execSync('git --version').toString());

    return !!match && (Number(match[1]) > 2 || (Number(match[1]) === 2 && Number(match[2]) >= 38));
  } catch {
    return false;
  }
})();

const engines: Array<'per-file' | 'tree'> = SUPPORTS_TREE ? ['per-file', 'tree'] : ['per-file'];

describe('resolveStrategy', () => {
  test('passes explicit engines through unchanged', async () => {
    expect(await resolveStrategy('per-file')).toBe('per-file');
    expect(await resolveStrategy('tree')).toBe('tree');
  });

  test('auto resolves to a concrete engine', async () => {
    expect(['tree', 'per-file']).toContain(await resolveStrategy('auto'));
  });
});

describe('applyIndexState', () => {
  test('pre-stages clean changes and marks conflicts as unmerged', async () => {
    const root = await mkTmp();
    const gitRoot = join(root, 'repo');
    const baseDir = join(root, 'base');
    const theirsDir = join(root, 'theirs');

    await Promise.all([
      mkdir(gitRoot, { recursive: true }),
      mkdir(baseDir, { recursive: true }),
      mkdir(theirsDir, { recursive: true }),
    ]);
    await execa('git', ['init', '-q'], { cwd: gitRoot });
    await execa('git', ['config', 'user.email', 't@t.com'], { cwd: gitRoot });
    await execa('git', ['config', 'user.name', 't'], { cwd: gitRoot });
    await execa('git', ['config', 'commit.gpgsign', 'false'], { cwd: gitRoot });

    // Committed (ours) state. `cf-added` is added by the merchant (add/add);
    // `cf-deleted` is absent (merchant deleted it → modify/delete).
    await Promise.all([
      write(join(gitRoot, 'applied.txt'), 'base\n'),
      write(join(gitRoot, 'conflict.txt'), 'ours\n'),
      write(join(gitRoot, 'cf-added.txt'), 'ours-added\n'),
      write(join(gitRoot, 'todelete.txt'), 'base\n'),
      write(join(gitRoot, 'package.json'), '{}\n'),
    ]);
    await execa('git', ['add', '-A'], { cwd: gitRoot });
    await execa('git', ['commit', '-qm', 'ours'], { cwd: gitRoot });

    // base + theirs trees the merge ran against.
    await Promise.all([
      write(join(baseDir, 'applied.txt'), 'base\n'),
      write(join(baseDir, 'conflict.txt'), 'base\n'),
      write(join(baseDir, 'cf-deleted.txt'), 'base\n'),
      write(join(baseDir, 'todelete.txt'), 'base\n'),
      write(join(theirsDir, 'applied.txt'), 'upstream\n'),
      write(join(theirsDir, 'conflict.txt'), 'theirs\n'),
      write(join(theirsDir, 'cf-added.txt'), 'theirs-added\n'),
      write(join(theirsDir, 'cf-deleted.txt'), 'theirs\n'),
      write(join(theirsDir, 'added.txt'), 'new\n'),
    ]);

    // Worktree as the engine + ref-stamp would have left it.
    await Promise.all([
      write(join(gitRoot, 'applied.txt'), 'upstream\n'),
      write(join(gitRoot, 'conflict.txt'), '<<<<<<< ours\nours\n=======\ntheirs\n>>>>>>> theirs\n'),
      write(
        join(gitRoot, 'cf-added.txt'),
        '<<<<<<< ours\nours-added\n=======\ntheirs-added\n>>>>>>> theirs\n',
      ),
      write(join(gitRoot, 'cf-deleted.txt'), 'theirs\n'),
      write(join(gitRoot, 'added.txt'), 'new\n'),
      write(join(gitRoot, 'package.json'), '{ "catalyst": {} }\n'),
      rm(join(gitRoot, 'todelete.txt'), { force: true }),
    ]);

    await applyIndexState(
      gitRoot,
      '.',
      baseDir,
      theirsDir,
      {
        applied: ['applied.txt'],
        added: ['added.txt'],
        deleted: ['todelete.txt'],
        conflicted: ['conflict.txt', 'cf-added.txt', 'cf-deleted.txt'],
      },
      true,
    );

    const status = (await execa('git', ['status', '--porcelain'], { cwd: gitRoot })).stdout;
    const line = (file: string) => status.split('\n').find((l) => l.endsWith(file)) ?? '';

    expect(line('applied.txt').startsWith('M')).toBe(true); // staged modify
    expect(line('added.txt').startsWith('A')).toBe(true); // staged add
    expect(line('todelete.txt').startsWith('D')).toBe(true); // staged delete
    expect(line('package.json').startsWith('M')).toBe(true); // stamped ref, staged
    expect(line('conflict.txt').startsWith('UU')).toBe(true); // both modified
    expect(line('cf-added.txt').startsWith('AA')).toBe(true); // both added
    expect(line('cf-deleted.txt').startsWith('DU')).toBe(true); // deleted by us
  }, 15_000);
});

// Both engines must satisfy the same MergeResult contract.
describe.each(engines)('mergeCore engine: %s', (engine) => {
  interface Fixture {
    base?: Record<string, string | Buffer>;
    theirs?: Record<string, string | Buffer>;
    ours?: Record<string, string | Buffer>;
  }

  async function setup(fixture: Fixture) {
    const root = await mkTmp();
    const baseDir = join(root, 'base');
    const theirsDir = join(root, 'theirs');
    const oursDir = join(root, 'ours');
    const emptyFile = join(root, '.empty');

    await Promise.all([
      mkdir(baseDir, { recursive: true }),
      mkdir(theirsDir, { recursive: true }),
      mkdir(oursDir, { recursive: true }),
    ]);
    await write(emptyFile, '');
    await Promise.all([
      ...Object.entries(fixture.base ?? {}).map(([k, v]) => write(join(baseDir, k), v)),
      ...Object.entries(fixture.theirs ?? {}).map(([k, v]) => write(join(theirsDir, k), v)),
      ...Object.entries(fixture.ours ?? {}).map(([k, v]) => write(join(oursDir, k), v)),
    ]);

    return { baseDir, theirsDir, oursDir, emptyFile };
  }

  const run = (baseDir: string, theirsDir: string, oursDir: string, emptyFile: string) =>
    engine === 'tree'
      ? mergeCoreTree(baseDir, theirsDir, oursDir)
      : mergeCorePerFile(baseDir, theirsDir, oursDir, emptyFile);

  test('clean modify: upstream change applies when ours == base', async () => {
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      base: { 'a.txt': 'one\ntwo\n' },
      theirs: { 'a.txt': 'one\ntwo-upstream\n' },
      ours: { 'a.txt': 'one\ntwo\n' },
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.applied).toContain('a.txt');
    expect(result.conflicted).toHaveLength(0);
    expect(await readFile(join(oursDir, 'a.txt'), 'utf-8')).toBe('one\ntwo-upstream\n');
  });

  test('overlapping modify: writes conflict markers, never throws', async () => {
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      base: { 'a.txt': 'line\n' },
      theirs: { 'a.txt': 'line-upstream\n' },
      ours: { 'a.txt': 'line-merchant\n' },
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.conflicted).toContain('a.txt');

    const merged = await readFile(join(oursDir, 'a.txt'), 'utf-8');

    expect(merged).toContain('<<<<<<< ours');
    expect(merged).toContain('>>>>>>> theirs');
  });

  test('added file is copied in', async () => {
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      theirs: { 'new.ts': 'export const x = 1;\n' },
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.added).toContain('new.ts');
    expect(await readFile(join(oursDir, 'new.ts'), 'utf-8')).toBe('export const x = 1;\n');
  });

  test('deleted upstream + unmodified locally is removed', async () => {
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      base: { 'gone.ts': 'old\n' },
      ours: { 'gone.ts': 'old\n' },
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.deleted).toContain('gone.ts');
    expect(await exists(join(oursDir, 'gone.ts'))).toBe(false);
  });

  test('modify/delete: merchant-deleted file upstream modified is restored + flagged', async () => {
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      base: { 'keep.ts': 'v1\n' },
      theirs: { 'keep.ts': 'v2\n' },
      // ours is missing keep.ts (merchant deleted it)
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.conflicted).toContain('keep.ts');
    expect(await readFile(join(oursDir, 'keep.ts'), 'utf-8')).toBe('v2\n');
  });

  test('binary change applies when ours == base (no corruption)', async () => {
    const baseBin = Buffer.from([0x89, 0x50, 0x00, 0x01]);
    const theirsBin = Buffer.from([0x89, 0x50, 0x00, 0x02, 0x03]);
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      base: { 'img.png': baseBin },
      theirs: { 'img.png': theirsBin },
      ours: { 'img.png': baseBin },
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.applied).toContain('img.png');
    expect(await readFile(join(oursDir, 'img.png'))).toEqual(theirsBin);
  });

  test('identical versions produce no changes', async () => {
    const { baseDir, theirsDir, oursDir, emptyFile } = await setup({
      base: { 'a.txt': 'same\n' },
      theirs: { 'a.txt': 'same\n' },
      ours: { 'a.txt': 'same\n' },
    });

    const result = await run(baseDir, theirsDir, oursDir, emptyFile);

    expect(result.applied).toHaveLength(0);
    expect(result.added).toHaveLength(0);
    expect(result.deleted).toHaveLength(0);
    expect(result.conflicted).toHaveLength(0);
  });
});

// The whole-tree engine's headline advantage over per-file: it follows renames
// and merges local edits across them (per-file would see delete + add instead).
describe.skipIf(!SUPPORTS_TREE)('mergeCoreTree rename fidelity', () => {
  test('follows a rename and carries a local edit across it', async () => {
    const root = await mkTmp();
    const baseDir = join(root, 'base');
    const theirsDir = join(root, 'theirs');
    const oursDir = join(root, 'ours');

    await Promise.all([
      mkdir(baseDir, { recursive: true }),
      mkdir(theirsDir, { recursive: true }),
      mkdir(oursDir, { recursive: true }),
    ]);

    // theirs renames old.ts → new.ts; ours edits old.ts in place. A rename-aware
    // merge lands the edit in new.ts; per-file would hit a modify/delete conflict.
    await Promise.all([
      write(join(baseDir, 'old.ts'), 'a\nb\nc\nd\ne\nf\n'),
      write(join(oursDir, 'old.ts'), 'a\nb\nc\nd\ne-merchant\nf\n'),
      write(join(theirsDir, 'new.ts'), 'a\nb\nc\nd\ne\nf\n'),
    ]);

    const result = await mergeCoreTree(baseDir, theirsDir, oursDir);

    expect(await exists(join(oursDir, 'new.ts'))).toBe(true);
    expect(await exists(join(oursDir, 'old.ts'))).toBe(false);
    expect(result.conflicted).toHaveLength(0);
    expect(await readFile(join(oursDir, 'new.ts'), 'utf-8')).toBe('a\nb\nc\nd\ne-merchant\nf\n');
  });
});
