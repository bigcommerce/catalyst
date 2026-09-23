import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { detectPackageManager as detectFromDir } from 'nypm';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

// Lockfile -> package manager, in nypm's own check order.
const PROJECT_LOCKFILES = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
] as const satisfies ReadonlyArray<readonly [string, PackageManager]>;

// Detect a project's package manager from its lockfile alone, returning null
// when the directory has none so the caller can decide its own last resort.
// Unlike detectProjectPackageManager() this never throws — nypm parses
// package.json to read `packageManager`, which blows up on a manifest left full
// of merge conflict markers — and it can express "I don't know", which nypm
// can't, since it falls back to npm internally.
export const detectLockfileManager = async (dir: string): Promise<PackageManager | null> => {
  const found = await Promise.all(
    PROJECT_LOCKFILES.map(async ([file, manager]) =>
      access(join(dir, file))
        .then(() => manager)
        .catch(() => null),
    ),
  );

  return found.find((manager) => manager !== null) ?? null;
};

// Detect the package manager that INVOKED the CLI (via npx / pnpm dlx / yarn dlx
// / bunx) by parsing the leading token of npm_config_user_agent, which every
// manager sets when it spawns a child process. This is deliberately not
// nypm.detectPackageManager(cwd): that keys off a lockfile in the project, which
// a freshly extracted project does not have yet.
export const detectPackageManager = (): PackageManager => {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const name = userAgent.split(' ')[0]?.split('/')[0];

  if (name === 'pnpm' || name === 'yarn' || name === 'bun') {
    return name;
  }

  // Some bunx versions omit npm_config_user_agent; fall back to the bun runtime marker.
  if (process.versions.bun) {
    return 'bun';
  }

  return 'npm';
};

// Detect the package manager an EXISTING project uses, from its lockfile or the
// package.json `packageManager` field. Used by flows that run inside an
// already-scaffolded project (e.g. `project link`), where a lockfile exists —
// unlike detectPackageManager(), which infers the INVOKING manager for a freshly
// extracted project that has no lockfile yet. Falls back to npm, since most
// users will have it installed, when detection is inconclusive or returns a
// manager we don't support.
export const detectProjectPackageManager = async (projectDir: string): Promise<PackageManager> => {
  const detected = await detectFromDir(projectDir);
  const name = detected?.name;

  if (name === 'pnpm' || name === 'yarn' || name === 'bun' || name === 'npm') {
    return name;
  }

  return 'npm';
};
