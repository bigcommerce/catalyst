import { execa } from 'execa';
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { z } from 'zod';

import { consola } from '../lib/logger';

const CorePackageJson = z.object({
  name: z.string().optional(),
  version: z.string(),
  catalyst: z.object({ version: z.string(), ref: z.string() }).optional(),
});

// ── small fs helpers ──────────────────────────────────────────────────────────
const pathExists = (p: string) =>
  access(p)
    .then(() => true)
    .catch(() => false);

async function listFiles(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);

  const nested = await Promise.all(
    entries.map((entry) => {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;

      return entry.isDirectory() ? listFiles(join(dir, entry.name), rel) : Promise.resolve([rel]);
    }),
  );

  return nested.flat();
}

async function filesEqual(a: string, b: string): Promise<boolean> {
  const [ba, bb] = await Promise.all([
    readFile(a).catch(() => null),
    readFile(b).catch(() => null),
  ]);

  return ba !== null && bb !== null && ba.equals(bb);
}

// Returns the fraction of files in baseDir that exist and are identical in
// destDir. Used to validate an inferred base: a correct base scores ~0.7-0.8+
// (the files the merchant hasn't touched); a wrong base scores much lower.
export async function computeBaseSimilarity(baseDir: string, destDir: string): Promise<number> {
  const baseFiles = await listFiles(baseDir);

  if (baseFiles.length === 0) return 0;

  const matches = await Promise.all(
    baseFiles.map((rel) => filesEqual(join(baseDir, rel), join(destDir, rel))),
  );

  return matches.filter(Boolean).length / baseFiles.length;
}

async function isBinary(p: string): Promise<boolean> {
  const buf = await readFile(p).catch(() => null);

  if (!buf) return false;

  // Same heuristic git uses: a NUL byte near the start means binary.
  return buf.subarray(0, 8000).includes(0);
}

async function copyInto(src: string, dest: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(src, dest);
}

// ── ref parsing ─────────────────────────────────────────────────────────────
// Splits "@bigcommerce/catalyst-core@1.7.0" → { packageName, version }.
// The last "@" separates the version (scoped names start with "@").
export function parseRef(ref: string): { packageName: string; version: string } {
  const lastAt = ref.lastIndexOf('@');

  if (lastAt <= 0) throw new Error(`Cannot parse ref "${ref}" — expected <package>@<version>.`);

  return { packageName: ref.slice(0, lastAt), version: ref.slice(lastAt + 1) };
}

async function readResolvedVersion(coreDir: string): Promise<string> {
  const raw = await readFile(join(coreDir, 'package.json'), 'utf-8');
  const pkg = CorePackageJson.parse(JSON.parse(raw));

  // catalyst.version is the source of truth; older tags lack it and fall back to version.
  return pkg.catalyst?.version ?? pkg.version;
}

// ── per-file 3-way merge engine ───────────────────────────────────────────────
type MergeOutcome = 'applied' | 'added' | 'deleted' | 'conflicted';

// Runs git merge-file (standalone, no object store) writing the merged result
// (with <<<ours/===/theirs>>> markers on conflict) to `oursPath`.
async function mergeFile(oursPath: string, basePath: string, theirsPath: string): Promise<boolean> {
  const merged = await execa(
    'git',
    [
      'merge-file',
      '-p',
      '-L',
      'ours',
      '-L',
      'base',
      '-L',
      'theirs',
      oursPath,
      basePath,
      theirsPath,
    ],
    { reject: false, stripFinalNewline: false },
  );

  // git merge-file exits 0 (clean) or N>0 (N conflict hunks) — both are normal.
  // A fatal error (e.g. unreadable file) produces stderr output; guard against
  // overwriting the user's file with empty/partial stdout in that case.
  if (merged.stderr) throw new Error(`git merge-file failed: ${merged.stderr}`);

  await writeFile(oursPath, merged.stdout);

  return (merged.exitCode ?? 0) > 0; // >0 = conflict hunks
}

async function mergeModified(
  rel: string,
  baseDir: string,
  theirsDir: string,
  catalystRoot: string,
): Promise<MergeOutcome | null> {
  const basePath = join(baseDir, rel);
  const theirsPath = join(theirsDir, rel);
  const oursPath = join(catalystRoot, rel);

  // Upstream didn't actually change this file — nothing to do.
  if (await filesEqual(basePath, theirsPath)) return null;

  // Merchant deleted a file upstream modifies → restore theirs, flag for review.
  if (!(await pathExists(oursPath))) {
    await copyInto(theirsPath, oursPath);

    return 'conflicted';
  }

  if ((await isBinary(basePath)) || (await isBinary(theirsPath)) || (await isBinary(oursPath))) {
    if (await filesEqual(oursPath, basePath)) {
      await copyInto(theirsPath, oursPath);

      return 'applied';
    }

    return 'conflicted'; // binary both-changed — can't 3-way; leave ours
  }

  return (await mergeFile(oursPath, basePath, theirsPath)) ? 'conflicted' : 'applied';
}

async function mergeAdded(
  rel: string,
  theirsDir: string,
  catalystRoot: string,
  emptyFile: string,
): Promise<MergeOutcome> {
  const theirsPath = join(theirsDir, rel);
  const oursPath = join(catalystRoot, rel);

  if (!(await pathExists(oursPath))) {
    await copyInto(theirsPath, oursPath);

    return 'added';
  }

  if (await filesEqual(oursPath, theirsPath)) return 'applied'; // merchant already has it

  if ((await isBinary(oursPath)) || (await isBinary(theirsPath))) return 'conflicted';

  // Both added a different version — merge against an empty ancestor.
  const hadConflict = await mergeFile(oursPath, emptyFile, theirsPath);

  return hadConflict ? 'conflicted' : 'applied';
}

async function mergeDeleted(
  rel: string,
  baseDir: string,
  catalystRoot: string,
): Promise<MergeOutcome | null> {
  const basePath = join(baseDir, rel);
  const oursPath = join(catalystRoot, rel);

  if (!(await pathExists(oursPath))) return null; // already gone

  // Merchant kept upstream's version → safe to delete. Otherwise it's a
  // delete/modify conflict: keep ours and flag.
  if (await filesEqual(oursPath, basePath)) {
    await rm(oursPath, { force: true });

    return 'deleted';
  }

  return 'conflicted';
}

export interface MergeResult {
  applied: string[];
  added: string[];
  deleted: string[];
  conflicted: string[];
}

// Per-file engine: walk the changed-file set and merge each file with
// `git merge-file`. Needs no git object store, so it works on shallow / no-history
// merchant repos. Trade-off: no rename detection (a rename = delete + add).
export async function mergeCorePerFile(
  baseDir: string,
  theirsDir: string,
  catalystRoot: string,
  emptyFile: string,
): Promise<MergeResult> {
  const baseFiles = new Set(await listFiles(baseDir));
  const theirsFiles = new Set(await listFiles(theirsDir));
  const result: MergeResult = { applied: [], added: [], deleted: [], conflicted: [] };

  const decide = async (rel: string): Promise<void> => {
    const inBase = baseFiles.has(rel);
    const inTheirs = theirsFiles.has(rel);

    let outcome: MergeOutcome | null;

    if (inBase && inTheirs) {
      outcome = await mergeModified(rel, baseDir, theirsDir, catalystRoot);
    } else if (inTheirs) {
      outcome = await mergeAdded(rel, theirsDir, catalystRoot, emptyFile);
    } else {
      outcome = await mergeDeleted(rel, baseDir, catalystRoot);
    }

    if (outcome) result[outcome].push(rel);
  };

  await Promise.all([...new Set([...baseFiles, ...theirsFiles])].map(decide));

  return result;
}

// ── merge strategy selection ───────────────────────────────────────────────────
export type MergeStrategy = 'auto' | 'tree' | 'per-file';

// `git merge-tree --write-tree` (the whole-tree engine) landed in git 2.38.
export async function gitSupportsMergeTree(): Promise<boolean> {
  try {
    const { stdout } = await execa('git', ['--version']);
    const match = /(\d+)\.(\d+)/.exec(stdout);

    if (!match) return false;

    const [major, minor] = [Number(match[1]), Number(match[2])];

    return major > 2 || (major === 2 && minor >= 38);
  } catch {
    return false;
  }
}

// 'auto' resolves to the whole-tree engine when git supports it, else per-file.
export async function resolveStrategy(strategy: MergeStrategy): Promise<'tree' | 'per-file'> {
  if (strategy !== 'auto') return strategy;

  if (await gitSupportsMergeTree()) return 'tree';

  consola.warn('git < 2.38 — using the per-file merge engine (no `git merge-tree`).');

  return 'per-file';
}

// ── whole-tree 3-way merge engine (git merge-tree, 2.38+) ──────────────────────
// Builds base/ours/theirs as commits in a throwaway object store, runs a real
// recursive merge (rename detection, modify/delete, mode changes, binary — all
// native to git), then materialises the merged tree into the catalyst root.
// Conflicts come back as in-blob <<<ours/===/theirs>>> markers; like per-file it
// never aborts. Branch names `ours`/`theirs` make the markers match the per-file
// engine's labels.
export async function mergeCoreTree(
  baseDir: string,
  theirsDir: string,
  catalystRoot: string,
): Promise<MergeResult> {
  const scratch = await mkdtemp(join(tmpdir(), 'catalyst-merge-'));

  try {
    await execa('git', ['init', '-q', scratch]);

    const env = {
      ...process.env,
      GIT_DIR: join(scratch, '.git'),
      GIT_AUTHOR_NAME: 'catalyst',
      GIT_AUTHOR_EMAIL: 'catalyst@bigcommerce.com',
      GIT_COMMITTER_NAME: 'catalyst',
      GIT_COMMITTER_EMAIL: 'catalyst@bigcommerce.com',
    };

    // Snapshot a directory as a tree object (own index per side; .gitignore is
    // honoured, so build artifacts like node_modules never enter the tree).
    const writeTree = async (workTree: string, tag: string): Promise<string> => {
      const sideEnv = {
        ...env,
        GIT_WORK_TREE: workTree,
        GIT_INDEX_FILE: join(scratch, `index.${tag}`),
      };

      await execa('git', ['add', '-A'], { env: sideEnv });

      return (await execa('git', ['write-tree'], { env: sideEnv })).stdout.trim();
    };

    const commitTree = (tree: string, parent?: string) =>
      execa('git', ['commit-tree', tree, '-m', 'x', ...(parent ? ['-p', parent] : [])], {
        env,
      }).then((r) => r.stdout.trim());

    const [baseTree, oursTree, theirsTree] = await Promise.all([
      writeTree(baseDir, 'base'),
      writeTree(catalystRoot, 'ours'),
      writeTree(theirsDir, 'theirs'),
    ]);

    const baseCommit = await commitTree(baseTree);
    const [oursCommit, theirsCommit] = await Promise.all([
      commitTree(oursTree, baseCommit),
      commitTree(theirsTree, baseCommit),
    ]);

    await Promise.all([
      execa('git', ['branch', 'ours', oursCommit], { env }),
      execa('git', ['branch', 'theirs', theirsCommit], { env }),
    ]);

    // -z --name-only output: <merged-tree-oid> NUL, then conflicted paths each
    // NUL-terminated, then an empty field marks the end of the conflicted set
    // (everything after is informational messages we don't need).
    const merge = await execa(
      'git',
      [
        'merge-tree',
        '--write-tree',
        '-z',
        '--name-only',
        `--merge-base=${baseCommit}`,
        'ours',
        'theirs',
      ],
      { env, reject: false },
    );

    if ((merge.exitCode ?? 0) > 1)
      throw new Error(merge.stderr || merge.stdout.slice(0, 500) || 'git merge-tree failed');

    // -z --name-only emits <merged-tree-oid>, then conflicted paths, then an
    // empty field; everything after that is informational and ignored.
    const fields = merge.stdout.split('\0');
    const mergedTree = fields[0];
    const afterOid = fields.slice(1);
    const emptyAt = afterOid.indexOf('');
    const conflicted = afterOid.slice(0, emptyAt === -1 ? afterOid.length : emptyAt);
    const conflictedSet = new Set(conflicted);

    // Materialise the merged tree into the catalyst root (conflict markers are
    // already baked into the conflicted blobs).
    const outEnv = {
      ...env,
      GIT_WORK_TREE: catalystRoot,
      GIT_INDEX_FILE: join(scratch, 'index.out'),
    };

    await execa('git', ['read-tree', mergedTree], { env: outEnv });
    await execa('git', ['checkout-index', '-a', '-f'], { env: outEnv });

    // Classify ours → merged. -z --name-status emits [status, path, status, …].
    const diff = await execa(
      'git',
      ['diff', '-z', '--no-renames', '--name-status', oursTree, mergedTree],
      { env },
    );

    const tokens = diff.stdout.split('\0');
    const changes: Array<{ status: string; path: string }> = [];

    for (let i = 0; i + 1 < tokens.length; i += 2) {
      const status = tokens[i];
      const path = tokens[i + 1];

      if (status && path && !conflictedSet.has(path)) {
        changes.push({ status, path });
      }
    }

    // checkout-index only writes; it won't remove paths the merge dropped.
    const deleted = changes.filter((change) => change.status === 'D').map((change) => change.path);

    await Promise.all(deleted.map((path) => rm(join(catalystRoot, path), { force: true })));

    return {
      applied: changes
        .filter((change) => change.status !== 'A' && change.status !== 'D')
        .map((change) => change.path),
      added: changes.filter((change) => change.status === 'A').map((change) => change.path),
      deleted,
      conflicted,
    };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

// ── index staging ──────────────────────────────────────────────────────────────
// After the merge, stage everything that merged cleanly (so the merchant only
// reviews what needs attention) and register conflicted files as real unmerged
// index entries: stage 1 = base, 2 = ours (the committed pre-upgrade blob),
// 3 = theirs. `git status` then reports them as conflicts (UU / AA / DU), which
// lights up editors' merge UIs. No MERGE_HEAD — the target tag isn't an ancestor,
// so resolving is a normal `git add` + commit, not a merge commit.
export async function applyIndexState(
  gitRoot: string,
  relDir: string,
  baseDir: string,
  theirsDir: string,
  result: MergeResult,
  stampedPkg: boolean,
): Promise<void> {
  const toRepoPath = (rel: string) => (relDir === '.' ? rel : `${relDir}/${rel}`);
  const pkgRel = 'package.json';

  // If the stamp resolved package.json (stripped its conflict markers and wrote
  // clean JSON), treat it as a clean file rather than a conflict — it should be
  // staged normally so it shows up in `git diff --cached`, not registered as UU.
  const stillConflicted = result.conflicted.filter((rel) => !(stampedPkg && rel === pkgRel));
  const conflictedRepoPaths = new Set(stillConflicted.map(toRepoPath));

  // 1. Pre-stage the clean changes (+ the resolved package.json when stamped).
  const clean = [...result.applied, ...result.added, ...result.deleted].map(toRepoPath);

  if (stampedPkg) clean.push(toRepoPath(pkgRel));

  const toStage = [...new Set(clean)].filter((path) => !conflictedRepoPaths.has(path));

  if (toStage.length) {
    await execa('git', ['add', '-A', '--', ...toStage], { cwd: gitRoot });
  }

  if (stillConflicted.length === 0) return;

  // 2. Conflicts → unmerged index entries. ours = the committed blob (the
  //    clean-tree precondition guarantees the worktree matched HEAD before the
  //    merge); base/theirs blobs get written into the repo's object store.
  const OID = /^[0-9a-f]{40,64}$/;
  // Detect SHA-256 repos (git 2.29+). SHA-1 uses a 40-zero null OID; SHA-256 uses 64.
  const gitFormat = (
    await execa('git', ['rev-parse', '--show-object-format'], { cwd: gitRoot, reject: false })
  ).stdout.trim();
  const NULL_OID = gitFormat === 'sha256' ? '0'.repeat(64) : '0'.repeat(40);

  // Write a file's content as a blob; null if the file is absent or the OID
  // comes back malformed (guards against shell wrappers polluting stdout).
  const hashBlob = async (file: string): Promise<string | null> => {
    if (!(await pathExists(file))) return null;

    const oid = (
      await execa('git', ['hash-object', '-w', '--', file], { cwd: gitRoot })
    ).stdout.trim();

    return OID.test(oid) ? oid : null;
  };

  // ours mode + blob via `ls-tree`. Unlike `rev-parse HEAD:<path>`, ls-tree
  // never echoes a missing path back as if it were an object name.
  const headEntry = async (repoPath: string): Promise<{ mode: string; oid: string } | null> => {
    const { stdout } = await execa('git', ['ls-tree', 'HEAD', '--', repoPath], {
      cwd: gitRoot,
      reject: false,
    });
    const match = /^(\d{6}) blob ([0-9a-f]+)\t/.exec(stdout);

    return match ? { mode: match[1], oid: match[2] } : null;
  };

  const records = await Promise.all(
    stillConflicted.map(async (rel) => {
      const repoPath = toRepoPath(rel);
      const [base, ours, theirs] = await Promise.all([
        hashBlob(join(baseDir, rel)),
        headEntry(repoPath),
        hashBlob(join(theirsDir, rel)),
      ]);

      return [
        `0 ${NULL_OID}\t${repoPath}`,
        ...(base ? [`100644 ${base} 1\t${repoPath}`] : []),
        ...(ours ? [`${ours.mode} ${ours.oid} 2\t${repoPath}`] : []),
        ...(theirs ? [`100644 ${theirs} 3\t${repoPath}`] : []),
      ].join('\n');
    }),
  );

  await execa('git', ['update-index', '--index-info'], {
    cwd: gitRoot,
    input: `${records.join('\n')}\n`,
  });
}

// Re-export readResolvedVersion so later PRs can use it without re-importing.
export { readResolvedVersion };
