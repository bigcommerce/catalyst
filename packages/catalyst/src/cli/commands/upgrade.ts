import { Command, Option } from '@commander-js/extra-typings';
import { confirm } from '@inquirer/prompts';
import { execa } from 'execa';
import {
  access,
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { minVersion, satisfies, lt as semverLt, validRange, valid as validSemver } from 'semver';
import yoctoSpinner from 'yocto-spinner';
import { z } from 'zod';

import { detectLockfileManager, PackageManager } from '../lib/detect-package-manager';
import { consola } from '../lib/logger';
import { getTelemetry } from '../lib/telemetry';

const CorePackageJson = z.object({
  name: z.string().optional(),
  version: z.string(),
  catalyst: z.object({ version: z.string(), ref: z.string() }).optional(),
});

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

const DepsPackageJson = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
});

const WorkspacePackageJson = z.object({ name: z.string(), version: z.string() });

// The CLI itself. `catalyst create` pins it exactly in devDependencies and it
// doesn't exist in the upstream tree, so no merge will ever move it.
const CATALYST_CLI_PACKAGE = '@bigcommerce/catalyst';

// Catalyst versions are git tags on the upstream monorepo (e.g.
// "@bigcommerce/catalyst-core@1.7.0"), NOT npm packages. GitHub serves a
// tarball for any tag via the repos/<owner>/<repo>/tarball/<ref> endpoint.
const DEFAULT_REPOSITORY = 'bigcommerce/catalyst';

// Moving tags that don't pin a concrete version. When the target is one of
// these we resolve the real version from the downloaded core/package.json so
// catalyst.ref records a stable pin rather than the alias.
const MOVING_TAGS = new Set(['latest', 'canary', 'alpha']);

// Known Catalyst package families, used to reconstruct a base ref from a
// project's package.json `name` when `catalyst.ref` is missing.
const KNOWN_FAMILIES = new Set([
  '@bigcommerce/catalyst-core',
  '@bigcommerce/catalyst-makeswift',
  '@bigcommerce/catalyst-b2b-makeswift',
  '@bigcommerce/catalyst-b2b',
]);

const CACHE_DIR = join(homedir(), '.cache', 'catalyst-cli', 'cores');

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

// ── Catalyst dependency reconciliation ────────────────────────────────────────
// Every tag's committed core/package.json still carries `workspace:` specifiers
// for the Catalyst packages: core is `private`, so it is never published and
// pnpm's publish-time rewrite never runs on the tagged tree. Base and theirs
// therefore agree on those lines, the merge correctly leaves ours alone, and the
// merchant's Catalyst dependency versions never move. `catalyst create` resolves
// them at scaffold time instead, which is why flat projects hold a real range
// and monorepo-structure projects still hold `workspace:^`.

// Package name → the version that tag published. Indexing can miss: a package
// that didn't exist yet at an older ref simply isn't in that tag's manifest.
export type WorkspaceVersions = Record<string, string | undefined>;

// A Catalyst dependency the merchant still references through the workspace
// protocol, alongside the published version it would migrate to.
export interface WorkspaceDepFinding {
  name: string;
  ours: string;
  version: string;
}

const readDepSpecifiers = (raw: string): Record<string, string | undefined> => {
  let parsed: z.infer<typeof DepsPackageJson>;

  try {
    parsed = DepsPackageJson.parse(JSON.parse(raw));
  } catch {
    return {}; // conflict markers or hand-broken JSON — nothing to reconcile
  }

  return Object.fromEntries(DEP_FIELDS.flatMap((field) => Object.entries(parsed[field] ?? {})));
};

// Scoped package names carry "@" and "/", and some carry "."; escape before
// embedding in a pattern.
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Swap a dependency's `workspace:` specifier for `^<version>` in raw
// package.json text. Deliberately textual rather than a JSON round-trip: parsing
// and re-stringifying would reformat the whole file, desyncing the downloaded
// trees from the merchant's copy and turning a one-line dependency bump into a
// whole-file conflict. It also keeps working on a file that still has conflict
// markers in other sections.
export const rewriteWorkspaceSpecifier = (raw: string, name: string, version: string): string =>
  raw.replace(
    new RegExp(`("${escapeRegExp(name)}"\\s*:\\s*)"workspace:[^"]*"`, 'g'),
    (_match, key: string) => `${key}"^${version}"`,
  );

// Rewrites the downloaded base/theirs package.json so each side names the
// version its own tag actually shipped. The normal 3-way merge then carries the
// bump for free — or conflicts, if the merchant pinned deliberately.
//
// A dependency the merchant still holds as `workspace:` is skipped on both
// sides: normalizing there would manufacture a conflict on something that works
// fine as-is. Those come back as findings for the migration prompt instead.
export async function normalizeWorkspaceDeps(
  ourPkgRaw: string,
  baseDir: string,
  theirsDir: string,
  baseVersions: WorkspaceVersions,
  targetVersions: WorkspaceVersions,
): Promise<{ workspace: WorkspaceDepFinding[]; bumped: string[] }> {
  const basePath = join(baseDir, 'package.json');
  const theirsPath = join(theirsDir, 'package.json');
  const [originalBase, originalTheirs] = await Promise.all([
    readFile(basePath, 'utf-8').catch(() => null),
    readFile(theirsPath, 'utf-8').catch(() => null),
  ]);

  if (originalBase === null || originalTheirs === null) return { workspace: [], bumped: [] };

  const ourSpecifiers = readDepSpecifiers(ourPkgRaw);
  const names = new Set(
    [
      ...Object.entries(readDepSpecifiers(originalBase)),
      ...Object.entries(readDepSpecifiers(originalTheirs)),
    ]
      .filter(([, range]) => range?.startsWith('workspace:'))
      .map(([name]) => name),
  );

  const decisions = [...names].map((name) => ({
    name,
    ours: ourSpecifiers[name],
    baseVersion: baseVersions[name],
    targetVersion: targetVersions[name],
  }));

  const workspace = decisions.flatMap(({ name, ours, targetVersion }) =>
    ours?.startsWith('workspace:') && targetVersion !== undefined
      ? [{ name, ours, version: targetVersion }]
      : [],
  );

  // Everything else gets both sides pinned to the version its own tag shipped.
  // A version is missing when the package didn't exist at that ref yet; leave
  // that side untouched so the merge sees no change rather than a bogus one.
  const normalizable = decisions.filter(({ ours }) => !ours?.startsWith('workspace:'));

  const baseRaw = normalizable.reduce(
    (acc, { name, baseVersion }) =>
      baseVersion === undefined ? acc : rewriteWorkspaceSpecifier(acc, name, baseVersion),
    originalBase,
  );
  const theirsRaw = normalizable.reduce(
    (acc, { name, targetVersion }) =>
      targetVersion === undefined ? acc : rewriteWorkspaceSpecifier(acc, name, targetVersion),
    originalTheirs,
  );
  const bumped = normalizable
    .filter(
      ({ baseVersion, targetVersion }) =>
        baseVersion !== undefined && targetVersion !== undefined && baseVersion !== targetVersion,
    )
    .map(({ name }) => name);

  await Promise.all([
    baseRaw === originalBase ? null : writeFile(basePath, baseRaw),
    theirsRaw === originalTheirs ? null : writeFile(theirsPath, theirsRaw),
  ]);

  return { workspace, bumped };
}

// Applies the findings to the merchant's own package.json text.
export const migrateWorkspaceDeps = (raw: string, findings: WorkspaceDepFinding[]): string =>
  findings.reduce((acc, { name, version }) => rewriteWorkspaceSpecifier(acc, name, version), raw);

// The CLI that performs upgrades can't upgrade itself through the merge, so
// check npm directly. Best-effort: a registry hiccup must never fail an upgrade.
export async function findStaleCli(
  pkgRaw: string,
): Promise<{ current: string; latest: string } | null> {
  const range = readDepSpecifiers(pkgRaw)[CATALYST_CLI_PACKAGE];

  // A merchant may point the dep at a tarball, git URL, or `link:` path, none of
  // which minVersion() can parse (it throws rather than returning null).
  if (range === undefined || !validRange(range)) return null;

  const body: unknown = await fetch(`https://registry.npmjs.org/${CATALYST_CLI_PACKAGE}/latest`, {
    // A hanging registry would otherwise stall the CLI indefinitely.
    signal: AbortSignal.timeout(5000),
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
  const latest = z.object({ version: z.string() }).safeParse(body).data?.version;

  // The registry promises a string, not a semver one, and an unparseable version
  // would throw straight out of satisfies(). A range that already admits the
  // published version needs no advisory either — the next install picks it up,
  // which leaves this for the exact pin `catalyst create` writes.
  if (latest === undefined || !validSemver(latest) || satisfies(latest, range)) return null;

  const current = minVersion(range)?.version;

  return current !== undefined && semverLt(current, latest) ? { current, latest } : null;
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
    // Disable line-ending conversion so checkout-index writes LF on all platforms.
    await execa('git', ['config', 'core.autocrlf', 'false'], {
      env: { ...process.env, GIT_DIR: join(scratch, '.git') },
    });

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

    // Run sequentially to avoid concurrent writes to the shared object store
    // on Windows, where simultaneous git processes cause EPERM on object files.
    const baseTree = await writeTree(baseDir, 'base');
    const oursTree = await writeTree(catalystRoot, 'ours');
    const theirsTree = await writeTree(theirsDir, 'theirs');

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
    await rm(scratch, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
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

// ── project (destination) layout resolution ───────────────────────────────────
// The command is merchant-facing and must support two repo shapes:
//   * flat (future)  — core/ contents at the repo root (package.json at root)
//   * nested (deprecated monorepo clone) — core/package.json under <root>/core
// We locate the package.json carrying the `catalyst` field; if none has it yet
// we fall back to the most likely Catalyst package.json so the auto-detect path
// can still run.
interface Project {
  gitRoot: string;
  catalystRoot: string;
  relDir: string; // "." (flat) or "core" (nested), relative to gitRoot
  pkgPath: string;
  rawContent: string;
  pkg: z.infer<typeof CorePackageJson>;
}

export async function resolveProject(cwd: string): Promise<Project | null> {
  let gitRoot: string;

  try {
    gitRoot = (await execa('git', ['rev-parse', '--show-toplevel'], { cwd })).stdout.trim();
  } catch {
    return null;
  }

  // Probe order favours the nested core/ first (a monorepo clone also has a
  // root package.json we don't want), then flat, then the cwd variants.
  const candidateDirs = [...new Set([join(gitRoot, 'core'), gitRoot, join(cwd, 'core'), cwd])];

  const parsed = (
    await Promise.all(
      candidateDirs.map(async (dir) => {
        const pkgPath = join(dir, 'package.json');
        const raw = await readFile(pkgPath, 'utf-8').catch(() => null);

        if (!raw) return null;

        let pkgJson: unknown;

        try {
          pkgJson = JSON.parse(raw);
        } catch {
          return null;
        }

        const result = CorePackageJson.safeParse(pkgJson);

        return result.success ? { dir, pkgPath, raw, pkg: result.data } : null;
      }),
    )
  ).filter((entry) => entry !== null);

  if (parsed.length === 0) return null;

  // Prefer the package.json that already declares `catalyst`; otherwise fall
  // back to one that looks like a Catalyst project (known family name).
  const chosen =
    parsed.find((p) => p.pkg.catalyst?.ref) ??
    parsed.find((p) => p.pkg.name !== undefined && KNOWN_FAMILIES.has(p.pkg.name)) ??
    parsed[0];

  return {
    gitRoot,
    catalystRoot: chosen.dir,
    relDir: relative(gitRoot, chosen.dir) || '.',
    pkgPath: chosen.pkgPath,
    rawContent: chosen.raw,
    pkg: chosen.pkg,
  };
}

// ── tarball download (source side stays the monorepo) ─────────────────────────
// Harvests the versions the monorepo's publishable packages carried at this ref.
// This is the only place they're knowable: the tag's core/package.json names them
// as `workspace:`, and they version independently of core (no changesets
// `linked`/`fixed` group), so an npm `latest` lookup would answer for today
// rather than for the ref being downloaded.
const readWorkspaceVersions = async (repoDir: string): Promise<WorkspaceVersions> => {
  const packagesDir = join(repoDir, 'packages');
  const entries = await readdir(packagesDir, { withFileTypes: true }).catch(() => []);

  const manifests = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const raw = await readFile(join(packagesDir, entry.name, 'package.json'), 'utf-8').catch(
          () => null,
        );

        if (raw === null) return null;

        try {
          return WorkspacePackageJson.parse(JSON.parse(raw));
        } catch {
          return null;
        }
      }),
  );

  return Object.fromEntries(
    manifests.filter((pkg) => pkg !== null).map(({ name, version }) => [name, version]),
  );
};

const readCachedVersions = async (path: string): Promise<WorkspaceVersions | null> => {
  const raw = await readFile(path, 'utf-8').catch(() => null);

  if (raw === null) return null;

  try {
    return z.record(z.string(), z.string()).parse(JSON.parse(raw));
  } catch {
    return null;
  }
};

export async function downloadCore(
  repository: string,
  ref: string,
  destDir: string,
  token?: string,
): Promise<WorkspaceVersions> {
  // Never cache moving tags (latest/canary/alpha) — they'd go stale silently.
  const cacheable = !MOVING_TAGS.has(parseRef(ref).version);
  // Use a separator before the ref so that repository strings differing only
  // by characters that sanitize to '_' (e.g. '/' vs '_') produce distinct keys.
  const cacheKey = `${repository.replace(/[^a-zA-Z0-9._-]/g, '_')}__${ref.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const cachePath = join(CACHE_DIR, cacheKey);
  const versionsPath = `${cachePath}.versions.json`;

  // Guard against a partially-written cache entry: two concurrent downloadCore
  // calls for the same ref can race — the first creates cachePath mid-copy, and
  // the second sees it as present but gets an incomplete directory. Validate with
  // a package.json sentinel (every extracted core/ tree must have one) plus the
  // versions sidecar, which also makes entries written before the sidecar existed
  // fall through to a fresh download rather than answering with no versions.
  const cachedVersions =
    cacheable && (await pathExists(join(cachePath, 'package.json')))
      ? await readCachedVersions(versionsPath)
      : null;

  if (cachedVersions) {
    await cp(cachePath, destDir, { recursive: true });

    return cachedVersions;
  }

  // encodeURIComponent turns "@bigcommerce/catalyst-core@1.7.0" into
  // "%40bigcommerce%2Fcatalyst-core%401.7.0", which the API accepts.
  const url = `https://api.github.com/repos/${repository}/tarball/${encodeURIComponent(ref)}`;
  const headers: Record<string, string> = {
    'User-Agent': 'catalyst-cli',
    Accept: 'application/vnd.github+json',
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    let hint = '';

    if (res.status === 404) hint = ` — tag "${ref}" not found in ${repository}`;
    if (res.status === 403) hint = ' — GitHub rate limit hit; set GITHUB_TOKEN to raise it';

    throw new Error(`GitHub returned ${res.status} for ${ref}${hint}`);
  }

  const tarballPath = `${destDir}.tgz`;
  const rawDir = `${destDir}.raw`;

  await writeFile(tarballPath, Buffer.from(await res.arrayBuffer()));
  await mkdir(rawDir, { recursive: true });
  // --strip-components=1 drops the "bigcommerce-catalyst-<sha>/" top dir.
  await execa('tar', ['-xzf', tarballPath, '-C', rawDir, '--strip-components=1']);

  // Source is expected to be the monorepo (core/ inside); fall back to the
  // extracted root for a hypothetical flat-source tag (insurance, not a target).
  const coreDir = join(rawDir, 'core');
  const sourceDir = (await pathExists(coreDir)) ? coreDir : rawDir;

  // Read the sibling packages before rawDir is torn down — destDir keeps core/ only.
  const workspaceVersions = await readWorkspaceVersions(rawDir);

  await rename(sourceDir, destDir);
  await rm(tarballPath, { force: true });
  await rm(rawDir, { recursive: true, force: true });

  if (cacheable) {
    await mkdir(CACHE_DIR, { recursive: true });
    await cp(destDir, cachePath, { recursive: true })
      .then(() => writeFile(versionsPath, JSON.stringify(workspaceVersions)))
      .catch(() => {
        /* best-effort cache; ignore failures */
      });
  }

  return workspaceVersions;
}

// ── base-ref resolution / auto-detect ─────────────────────────────────────────
// Returns the base ref to diff from, auto-detecting when catalyst.ref is absent.
export async function resolveBaseRef(
  project: Project,
  fromOption: string | undefined,
  assumeYes: boolean,
): Promise<string | null> {
  if (project.pkg.catalyst?.ref) return project.pkg.catalyst.ref;
  if (fromOption) return fromOption;

  // Older projects mirror the Catalyst version in `version`; the package `name`
  // tells us the family. Propose the inferred ref and let the merchant confirm.
  const family =
    project.pkg.name && KNOWN_FAMILIES.has(project.pkg.name)
      ? project.pkg.name
      : '@bigcommerce/catalyst-core';
  const guess = `${family}@${project.pkg.version}`;

  consola.warn(`No \`catalyst.ref\` found in package.json. Inferred base: ${guess}`);

  if (assumeYes) return guess;

  const ok = await confirm({ message: `Upgrade from ${guess}?`, default: true }).catch(() => false);

  if (!ok) {
    consola.info('Re-run with `--from <ref>` to set the base version explicitly.');

    return null;
  }

  return guess;
}

// ── summary output ────────────────────────────────────────────────────────────
function printWorkspaceFindings(findings: WorkspaceDepFinding[]): void {
  if (findings.length === 0) return;

  const pad = Math.max(...findings.map((finding) => finding.name.length));
  const rows = findings
    .map((finding) => `  ${finding.name.padEnd(pad)}  ${finding.ours} → ^${finding.version}`)
    .join('\n');

  consola.warn(
    `Catalyst dependencies still using the workspace protocol (${findings.length}):\n${rows}\n\nThey resolve to your local packages/ copies, which \`catalyst upgrade\` does not update — so they never receive upgrades.`,
  );
}

interface Summary {
  result: MergeResult;
  relDir: string;
  stampedPkg: boolean;
  migratedDeps: number;
  packageManager: PackageManager;
  staleCli: { current: string; latest: string } | null;
}

function printSummary({
  result,
  relDir,
  stampedPkg,
  migratedDeps,
  packageManager,
  staleCli,
}: Summary): void {
  // package.json is excluded from the conflict list when the stamp resolved it.
  const unresolved = result.conflicted.filter((f) => !(stampedPkg && f === 'package.json'));

  const parts = [
    `${result.applied.length} updated`,
    `${result.added.length} added`,
    `${result.deleted.length} removed`,
  ];

  if (unresolved.length) parts.push(`${unresolved.length} with conflicts`);

  consola.log(`\n${parts.join(', ')}`);

  // Any package.json change can move dependencies, and the upgrade never installs,
  // so the lockfile is left behind either way.
  const pkgConflicted = unresolved.includes('package.json');
  const depsChanged =
    migratedDeps > 0 ||
    [...result.applied, ...result.added, ...result.conflicted].includes('package.json');

  // Stay quiet while package.json itself is unresolved: an install against a
  // manifest full of conflict markers just fails. It joins the resolution steps
  // below instead, so it runs in the right order.
  if (depsChanged && !pkgConflicted) {
    consola.info(
      `Dependencies changed — run \`${packageManager} install\` to update your lockfile.`,
    );
  }

  if (unresolved.length) {
    const files = unresolved.map((f) => `  ${f}`).join('\n');
    const install = depsChanged && pkgConflicted ? ` && ${packageManager} install` : '';

    consola.warn(
      `\nStaged the clean changes. ${unresolved.length} file(s) need conflict resolution (the <<<ours/===/theirs>>> markers):\n${files}\n\nResolve them, then: git add ${relDir} && git commit${install}`,
    );
  } else {
    consola.success('Staged all changes — review with `git diff --cached`, then commit.');
  }

  if (staleCli) {
    consola.info(
      `Your Catalyst CLI is behind (${staleCli.current} → ${staleCli.latest}). Update it with \`${packageManager} add -D ${CATALYST_CLI_PACKAGE}@${staleCli.latest}\`.`,
    );
  }
}

export const upgrade = new Command('upgrade')
  .configureHelp({ showGlobalOptions: true })
  .aliases([
    'up',
    // These are hidden aliases
    'upgrayedd',
    'ugrad',
  ])
  .description('Upgrade your Catalyst project to a newer version by applying a 3-way merge.')
  .argument('[version]', 'Target version to upgrade to (default: latest)')
  .addOption(
    new Option(
      '--ref <ref>',
      'Full git tag to upgrade to, e.g. an integration family like @bigcommerce/catalyst-makeswift@1.7.0. Overrides [version].',
    ),
  )
  .addOption(new Option('--from <ref>', 'Base ref to upgrade from (when catalyst.ref is missing)'))
  .option('--dry-run', 'Generate and display the diff without applying it')
  .option('--yes', 'Skip confirmation prompts (e.g. inferred base ref)')
  .addOption(
    new Option(
      '--strategy <strategy>',
      'Merge engine: tree (git merge-tree, full fidelity), per-file (git merge-file, no-history fallback), or auto (tree when git >= 2.38, else per-file)',
    )
      .choices(['auto', 'tree', 'per-file'] as const)
      .default('auto' as const)
      .hideHelp(),
  )
  .addOption(
    new Option('--repository <owner/repo>', 'GitHub repository to pull versions from').default(
      DEFAULT_REPOSITORY,
    ),
  )
  .addHelpText(
    'after',
    `
Examples:
  # Upgrade to the latest Catalyst version
  $ catalyst upgrade

  # Upgrade to a specific version
  $ catalyst upgrade 1.8.0

  # Preview what would change without applying
  $ catalyst upgrade --dry-run

  # Upgrade to an integration family (makeswift, b2b-makeswift, ...)
  $ catalyst upgrade --ref @bigcommerce/catalyst-makeswift@1.7.0

Conflicts are written as standard <<<ours/===/theirs>>> markers — the upgrade
never aborts. Versions are git tags on the repository (not npm). Set GITHUB_TOKEN
to raise the GitHub API rate limit.`,
  )
  // eslint-disable-next-line complexity
  .action(async (version, options) => {
    // ── 1. Resolve the merchant project (flat or nested layout) ───────────
    const project = await resolveProject(process.cwd());

    if (!project) {
      consola.error(
        'Run `catalyst upgrade` from inside a Catalyst git repository (flat core/ repo or a project containing core/).',
      );
      process.exit(1);
    }

    const { gitRoot, catalystRoot, relDir, pkgPath } = project;

    // ── 2. Resolve base + target refs ─────────────────────────────────────
    const baseRef = await resolveBaseRef(project, options.from, options.yes ?? false);

    if (!baseRef) process.exit(1);

    let basePackage: string;
    let upstreamRef: string;
    let upstreamTagVersion: string;

    try {
      ({ packageName: basePackage } = parseRef(baseRef));
      upstreamRef = options.ref ?? `${basePackage}@${version ?? 'latest'}`;
      ({ version: upstreamTagVersion } = parseRef(upstreamRef));
    } catch {
      consola.error(
        `Invalid ref format — expected <package>@<version> (e.g. @bigcommerce/catalyst-core@1.7.0). Got: "${baseRef}"`,
      );
      process.exit(1);
    }

    if (upstreamRef === baseRef) {
      consola.success('Already up to date.');

      return;
    }

    // ── 3. Require a clean working tree at the catalyst root (preview exempt) ─
    // The merge writes in place, so pre-existing uncommitted edits would be
    // indistinguishable from the upgrade. Committing/stashing first gives the
    // merchant a clean point to diff and roll back from.
    if (!options.dryRun) {
      const statusArgs = relDir === '.' ? [] : ['--', relDir];
      const status = await execa('git', ['status', '--porcelain', ...statusArgs], {
        cwd: gitRoot,
        reject: false,
      });

      if (status.stdout.trim()) {
        const where = relDir === '.' ? 'The repo' : `${relDir}/`;

        consola.error(
          `${where} has uncommitted changes. Commit or stash them before upgrading, so the upgrade is isolated and reversible:\n  git add ${relDir} && git commit -m "snapshot before upgrade"\n  # or: git stash`,
        );
        process.exit(1);
      }
    }

    // ── 3b. Backfill catalyst.ref when it was inferred ────────────────────
    // If catalyst.ref was absent and the user confirmed an inferred base (not
    // an explicit --from), write the field and stage it so it travels with the
    // upgrade commit. Runs after the clean-tree check so we only add to an
    // already-clean index. --from is excluded: the user already knows the base
    // and shouldn't get an extra staged change they didn't ask for.
    if (!project.pkg.catalyst?.ref && !options.from && !options.dryRun) {
      const { version: baseVersion } = parseRef(baseRef);
      const rawPkg = await readFile(pkgPath, 'utf-8');
      const parsedPkg = z.record(z.string(), z.unknown()).parse(JSON.parse(rawPkg));

      parsedPkg.catalyst = { version: baseVersion, ref: baseRef };
      await writeFile(pkgPath, `${JSON.stringify(parsedPkg, null, 2)}\n`);
      await execa('git', ['add', '--', pkgPath], { cwd: gitRoot });
      consola.success(`Added catalyst.ref → ${baseRef}`);
    }

    const token = process.env.GITHUB_TOKEN;
    const tmpDir = await mkdtemp(join(tmpdir(), 'catalyst-upgrade-'));

    try {
      const baseDir = join(tmpDir, 'base');
      const theirsDir = join(tmpDir, 'theirs');
      const emptyFile = join(tmpDir, '.empty');

      await writeFile(emptyFile, '');

      // Start the registry check now so its round-trip overlaps the tarball
      // downloads rather than adding dead air after the merge. Reading the
      // pre-merge manifest is also more robust: the CLI dependency isn't in
      // either upstream tree, so nothing below can move it, and this way the
      // advisory survives a merge that leaves conflict markers in package.json.
      const staleCliCheck = findStaleCli(project.rawContent).catch(() => null);

      const downloadSpinner = yoctoSpinner().start(`Downloading ${baseRef} and ${upstreamRef}...`);

      let baseVersions: WorkspaceVersions;
      let targetVersions: WorkspaceVersions;

      try {
        [baseVersions, targetVersions] = await Promise.all([
          downloadCore(options.repository, baseRef, baseDir, token),
          downloadCore(options.repository, upstreamRef, theirsDir, token),
        ]);
        downloadSpinner.success('Downloaded both versions.');
      } catch (err) {
        downloadSpinner.error('Download failed');
        throw err;
      }

      // When the base was auto-inferred (no catalyst.ref, no --from), validate
      // the guess by checking how many base files are unmodified in the project.
      // A correct base scores ~70-80%+; a wrong guess (e.g. merchant manually
      // bumped their version field without actually upgrading) scores much lower.
      if (!project.pkg.catalyst?.ref && !options.from) {
        const similarity = await computeBaseSimilarity(baseDir, catalystRoot);
        const pct = Math.round(similarity * 100);

        if (similarity < 0.5) {
          consola.warn(
            `Low confidence in inferred base ${baseRef} (${pct}% of base files match your project). If the merge result looks off, re-run with \`--from <correct-version>\` to set the base explicitly.`,
          );
        }
      }

      // For moving tags (latest/canary/alpha) we don't know the real version
      // until the tarball lands, so read it from the downloaded package.json.
      // For concrete tags the version is already in the tag itself.
      const resolvedVersion = MOVING_TAGS.has(upstreamTagVersion)
        ? await readResolvedVersion(theirsDir)
        : upstreamTagVersion;
      const newRef = MOVING_TAGS.has(upstreamTagVersion)
        ? `${basePackage}@${resolvedVersion}`
        : upstreamRef;

      // ── 3c. Teach the merge about Catalyst dependency versions ──────────
      // Runs before the dry run so the preview shows the dependency change too.
      // rawContent predates the 3b backfill, which only touches the `catalyst`
      // field — dependency specifiers are identical either way.
      const { workspace: workspaceDeps, bumped } = await normalizeWorkspaceDeps(
        project.rawContent,
        baseDir,
        theirsDir,
        baseVersions,
        targetVersions,
      );

      // ── 4. Dry run: show the unified diff and stop ──────────────────────
      if (options.dryRun) {
        const diffSpinner = yoctoSpinner().start('Generating diff...');
        const diff = await execa(
          'git',
          ['diff', '--no-index', '--binary', '--diff-algorithm=histogram', 'base', 'theirs'],
          { cwd: tmpDir, reject: false, stripFinalNewline: false },
        );

        if ((diff.exitCode ?? 0) > 1) {
          diffSpinner.error('Failed to generate diff');
          throw new Error(diff.stderr);
        }

        if (!diff.stdout.trim()) {
          diffSpinner.success('No differences between versions — already up to date.');

          return;
        }

        const fileCount = (diff.stdout.match(/^diff --git /gm) ?? []).length;

        diffSpinner.success(`Diff ready — ${fileCount} file(s) affected.`);
        consola.log('\nDiff preview (--dry-run, not applied):\n');
        consola.log(diff.stdout);

        printWorkspaceFindings(workspaceDeps);

        return;
      }

      // ── 5. Apply via 3-way merge (whole-tree by default, per-file fallback) ─
      const strategy = await resolveStrategy(options.strategy);
      const mergeSpinner = yoctoSpinner().start(`Merging changes (${strategy})...`);
      const result =
        strategy === 'tree'
          ? await mergeCoreTree(baseDir, theirsDir, catalystRoot)
          : await mergeCorePerFile(baseDir, theirsDir, catalystRoot, emptyFile);
      const total =
        result.applied.length +
        result.added.length +
        result.deleted.length +
        result.conflicted.length;

      if (total === 0) {
        mergeSpinner.success('No differences between versions — already up to date.');

        return;
      }

      if (result.conflicted.length) {
        mergeSpinner.warning('Merged with conflicts — resolve the markers, then commit.');
      } else {
        mergeSpinner.success('Merged cleanly.');
      }

      // ── 6. Stamp catalyst.ref (skip if package.json itself conflicted) ──
      const patchedRaw = await readFile(pkgPath, 'utf-8');

      // Non-null once the stamp has written clean JSON, and then it is exactly
      // what sits on disk. Stays null when package.json came out of the merge
      // carrying conflict markers.
      let stampedText: string | null = null;

      try {
        const patchedPkg = z.record(z.string(), z.unknown()).parse(JSON.parse(patchedRaw));

        patchedPkg.catalyst = { version: resolvedVersion, ref: newRef };
        stampedText = `${JSON.stringify(patchedPkg, null, 2)}\n`;
        await writeFile(pkgPath, stampedText);
        consola.success(`catalyst.ref updated → ${newRef}`);
      } catch {
        // package.json has conflict markers (scripts, deps, etc.). The catalyst
        // field was added cleanly by ours and should sit outside the conflict
        // blocks — so replace just that field in-place, leaving all other conflict
        // markers intact for the merchant to resolve normally.
        const catalystReplacement = JSON.stringify(
          { version: resolvedVersion, ref: newRef },
          null,
          2,
        )
          .split('\n')
          .map((line, i) => (i === 0 ? line : `  ${line}`))
          .join('\n');

        // Use a function replacer to prevent $-interpolation in the replacement string
        // (e.g. $& or $1 in a ref/version value would silently corrupt the output).
        const updated = patchedRaw.replace(
          /"catalyst":\s*\{[^}]*\}/,
          () => `"catalyst": ${catalystReplacement}`,
        );

        if (updated !== patchedRaw) {
          await writeFile(pkgPath, updated);
          // stampedText stays null — the file still has conflict markers in other
          // sections, so it must stay as a UU unmerged entry so the editor shows
          // the merge UI. Only the catalyst field was resolved in place.
          consola.success(`catalyst.ref updated → ${newRef}`);
          consola.info(
            'package.json still has conflicts in other sections — resolve them, then: git add package.json',
          );
        } else {
          consola.warn(
            `package.json has conflicts — after resolving, add:\n  "catalyst": { "version": "${resolvedVersion}", "ref": "${newRef}" }`,
          );
        }
      }

      // ── 6b. Offer to migrate workspace-protocol Catalyst dependencies ────
      printWorkspaceFindings(workspaceDeps);

      let migratedDeps = 0;

      if (workspaceDeps.length) {
        // Rewriting a package.json that still holds conflict markers could land
        // inside a hunk the merchant hasn't reviewed, so the swap is only ever
        // applied to a file the stamp already parsed cleanly. Past that, --yes
        // means yes (as it does for the inferred base ref), and a non-interactive
        // run falls through to printing the versions.
        const accepted =
          stampedText !== null &&
          (options.yes === true ||
            (Boolean(process.stdin.isTTY) &&
              (await confirm({
                message: 'Replace them with the published versions?',
                default: true,
              }).catch(() => false))));

        if (accepted && stampedText !== null) {
          await writeFile(pkgPath, migrateWorkspaceDeps(stampedText, workspaceDeps));
          migratedDeps = workspaceDeps.length;
          consola.success(
            `Migrated ${migratedDeps} dependenc${migratedDeps === 1 ? 'y' : 'ies'} to published versions.`,
          );
        } else {
          consola.info(
            "Keeping the workspace references. Switching abandons any local packages/ copy you've customized; otherwise apply the versions above in package.json and reinstall.",
          );
        }
      }

      // ── 7. Stage the clean changes; mark conflicts as real unmerged entries ─
      // Staging is a convenience; the merge already landed on disk, so never let
      // a git quirk here fail the whole upgrade.
      try {
        await applyIndexState(gitRoot, relDir, baseDir, theirsDir, result, stampedText !== null);
      } catch (err) {
        consola.warn(
          `Couldn't auto-stage the changes (${err instanceof Error ? err.message : String(err)}). Your files are merged on disk — run \`git add ${relDir}\` yourself.`,
        );
      }

      const gitVersion = await execa('git', ['--version'])
        .then((r) => r.stdout.trim())
        .catch(() => 'unknown');

      // The lockfile lives at the repo root for both layouts and is committed by
      // every real project, so it answers this on its own. Catalyst scaffolds with
      // pnpm, which makes it the least-surprising answer when there isn't one.
      const packageManager = (await detectLockfileManager(gitRoot)) ?? 'pnpm';
      const staleCli = await staleCliCheck;

      await getTelemetry().track('upgrade', {
        strategy,
        gitVersion,
        dryRun: Boolean(options.dryRun),
        applied: result.applied.length,
        added: result.added.length,
        deleted: result.deleted.length,
        conflicts: result.conflicted.length,
        hasConflicts: result.conflicted.length > 0,
        workspaceDepsFound: workspaceDeps.length,
        workspaceDepsMigrated: migratedDeps,
        catalystDepsBumped: bumped.length,
        cliOutdated: staleCli !== null,
      });

      printSummary({
        result,
        relDir,
        stampedPkg: stampedText !== null,
        migratedDeps,
        packageManager,
        staleCli,
      });
    } finally {
      await rm(tmpDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
    }
  });
