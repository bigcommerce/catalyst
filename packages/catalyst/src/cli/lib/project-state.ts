import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const projectJsonSchema = z.looseObject({
  projectUuid: z.string().optional(),
});

const packageJsonSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
});

export interface ProjectState {
  projectUuid: string | undefined;
  hasMiddleware: boolean;
  hasProxy: boolean;
  hasOpenNextDep: boolean;

  // Derived signals — `isLinked` reflects intent (UUID registered via
  // `catalyst projects create` or commerce-hosting setup); `isTransformed`
  // reflects on-disk readiness (middleware.ts swapped in, OpenNext dep
  // installed). A deploy needs both, but `catalyst build` only cares about
  // `isTransformed` so it can dispatch to OpenNext vs `next build`.
  isLinked: boolean;
  isTransformed: boolean;
  isFullySetUp: boolean;
}

const safeReadJson = (path: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
};

// Read-only inspection of a Catalyst project at `cwd` (typically `core/`).
// Avoids `getProjectConfig()` deliberately — that would instantiate `Conf`
// and create `.bigcommerce/` as a side effect.
export function getProjectState(cwd: string = process.cwd()): ProjectState {
  const projectJson = projectJsonSchema.safeParse(
    safeReadJson(join(cwd, '.bigcommerce', 'project.json')),
  );
  const projectUuid = projectJson.success ? projectJson.data.projectUuid : undefined;

  const hasMiddleware = existsSync(join(cwd, 'middleware.ts'));
  const hasProxy = existsSync(join(cwd, 'proxy.ts'));

  const pkgJson = packageJsonSchema.safeParse(safeReadJson(join(cwd, 'package.json')));
  const hasOpenNextDep = pkgJson.success
    ? Boolean(pkgJson.data.dependencies?.['@opennextjs/cloudflare'])
    : false;

  const isLinked = Boolean(projectUuid);
  const isTransformed = hasMiddleware && !hasProxy && hasOpenNextDep;
  const isFullySetUp = isLinked && isTransformed;

  return {
    projectUuid,
    hasMiddleware,
    hasProxy,
    hasOpenNextDep,
    isLinked,
    isTransformed,
    isFullySetUp,
  };
}
