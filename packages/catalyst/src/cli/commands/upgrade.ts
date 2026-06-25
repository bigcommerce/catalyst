import { execa } from 'execa';
import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { z } from 'zod';

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

// Re-export readResolvedVersion so later PRs can use it without re-importing.
export { readResolvedVersion };
