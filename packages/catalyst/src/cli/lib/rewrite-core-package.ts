import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

import { consola } from './logger';
import { sortPackageJsonFields } from './sort-package-json';

// Native-module build allowlist, lifted from the monorepo's root
// pnpm-workspace.yaml `onlyBuiltDependencies`. A standalone install needs this so
// pnpm (`pnpm.onlyBuiltDependencies`) and bun (`trustedDependencies`) run the
// native postinstall builds without prompting. npm/yarn-classic run them anyway.
const NATIVE_BUILD_ALLOWLIST = [
  '@parcel/watcher',
  '@swc/core',
  '@vercel/speed-insights',
  'esbuild',
  'msw',
  'protobufjs',
  'puppeteer',
  'sharp',
  'workerd',
];

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

const corePackageJsonSchema = z.looseObject({
  version: z.string().optional(),
  private: z.boolean().optional(),
  scripts: z.record(z.string(), z.string()).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  pnpm: z.looseObject({}).optional(),
  catalyst: z.looseObject({}).optional(),
});

const registryVersionSchema = z.object({ version: z.string() });

// Resolve the published npm version for a workspace dependency. The extracted
// tag tree still carries `workspace:^` (core is private, so changesets' publish-
// time rewrite never touches the committed tree) — so we resolve the real
// version at extraction time from the npm registry.
//
// NOTE: `latest` answers for today, not for `ref`. These packages version
// independently of core (the changesets config has no `linked`/`fixed` group),
// so scaffolding from an older `--gh-ref` can splice in a newer version than
// that tag shipped. Harmless while they stay in step, wrong at the first major
// bump. `catalyst upgrade` reads the versions out of the tag's own
// `packages/*/package.json`; this path can't yet, because `extractCatalyst`
// filters the tarball down to `core/`. Tracked as a follow-up.
const resolvePublishedVersion = async (pkgName: string): Promise<string> => {
  const response = await fetch(`https://registry.npmjs.org/${pkgName}/latest`);

  if (!response.ok) {
    throw new Error(
      `Could not resolve a published version for "${pkgName}" (HTTP ${response.status}). ` +
        'The extracted project still references it via the workspace protocol and cannot be installed.',
    );
  }

  const { version } = registryVersionSchema.parse(await response.json());

  return `^${version}`;
};

// Transforms an extracted `core/package.json` into an installable, standalone
// manifest: resolves `workspace:` deps to published versions, drops `private`,
// bakes the native-build allowlist for pnpm/bun, strips monorepo-only (turbo)
// scripts, and records the Catalyst version/ref the project was created from.
// Also writes `.npmrc` so npm tolerates react-headroom's stale react peer range.
export const rewriteCorePackage = async (projectDir: string, ref: string) => {
  const packageJsonPath = join(projectDir, 'package.json');
  const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(packageJsonPath, 'utf-8')));

  // Collect every workspace-protocol dependency across all dep fields, keeping a
  // reference to its owning record so we can rewrite it in place after resolving.
  const workspaceDeps = DEP_FIELDS.flatMap((field) => {
    const deps = pkg[field];

    if (!deps) return [];

    return Object.entries(deps)
      .filter(([, range]) => range.startsWith('workspace:'))
      .map(([name]) => ({ deps, name }));
  });

  await Promise.all(
    workspaceDeps.map(async ({ deps, name }) => {
      const resolved = await resolvePublishedVersion(name);

      deps[name] = resolved;
      consola.info(`Resolved ${name} to ${resolved}`);
    }),
  );

  // Merchants need an installable project; `private` blocks publish/install ergonomics.
  delete pkg.private;

  // Drop any monorepo-only scripts that shell out to turbo.
  if (pkg.scripts) {
    pkg.scripts = Object.fromEntries(
      Object.entries(pkg.scripts).filter(([, command]) => !command.includes('turbo')),
    );
  }

  pkg.pnpm = { ...pkg.pnpm, onlyBuiltDependencies: NATIVE_BUILD_ALLOWLIST };
  pkg.trustedDependencies = NATIVE_BUILD_ALLOWLIST;

  // Track what this project was scaffolded from (consumed by `catalyst upgrade`
  // and the backend user-agent). `ref` is the exact ref extracted.
  pkg.catalyst = { ...pkg.catalyst, version: pkg.version, ref };

  writeFileSync(packageJsonPath, `${JSON.stringify(sortPackageJsonFields(pkg), null, 2)}\n`);

  // react-headroom (unmaintained) declares a react <=18 peer; core ships react 19.
  // pnpm/yarn/bun tolerate it, but npm errors ERESOLVE without this.
  writeFileSync(join(projectDir, '.npmrc'), 'legacy-peer-deps=true\n');
};
