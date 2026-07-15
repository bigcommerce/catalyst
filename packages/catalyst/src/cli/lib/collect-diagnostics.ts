import { parse } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { release } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

import PACKAGE_INFO from '../../../package.json';

import { detectPackageManager, type PackageManager } from './detect-package-manager';
import { getProjectState } from './project-state';
import { getTelemetry } from './telemetry';

// Env vars the CLI reads (see the config-priority chain in program.ts and
// required-build-env.ts). We report only WHERE each is set (or that it is
// unset) — never its value — so the diagnostic report can never leak a token,
// secret, or store identifier.
export const REPORTED_ENV_VARS = [
  'CATALYST_STORE_HASH',
  'BIGCOMMERCE_STORE_HASH',
  'CATALYST_ACCESS_TOKEN',
  'CATALYST_PROJECT_UUID',
  'BIGCOMMERCE_API_HOST',
  'BIGCOMMERCE_LOGIN_URL',
  'BIGCOMMERCE_STOREFRONT_TOKEN',
  'BIGCOMMERCE_CHANNEL_ID',
  'AUTH_SECRET',
  'CATALYST_TELEMETRY_DISABLED',
] as const;

// Env files `build`/`deploy` auto-load, in precedence order (see build-env.ts).
// `debug` doesn't load them into process.env — it only inspects their KEYS so
// the report reflects what a build would resolve, without side effects.
const ENV_FILES = ['.env.local', '.env'] as const;

// Lockfile -> package manager, checked in this order. This detects the
// project's package manager (what `build`/`deploy` shell out to) rather than
// whatever invoked the CLI, which is what a bug report actually needs.
const PROJECT_LOCKFILES: ReadonlyArray<readonly [string, PackageManager]> = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
];

// Where a value resolved from, following the CLI's priority chain
// (process.env > .env.local > .env > .bigcommerce/project.json). Flags are
// excluded because `debug` takes none of the credential flags itself.
export type EnvSource = 'process.env' | (typeof ENV_FILES)[number];
export type ConfigSource = EnvSource | 'project.json' | 'unset';

export interface ResolvedValue {
  present: boolean;
  source: ConfigSource;
}

export interface Diagnostics {
  cli: {
    name: string;
    version: string;
  };
  runtime: {
    node: string;
    platform: string;
    arch: string;
    osRelease: string;
    packageManager: PackageManager;
  };
  project: {
    cwd: string;
    // The storefront (Catalyst core) package name + version from the project's
    // package.json, resolved the same way `upgrade` does. null when absent.
    coreName: string | null;
    coreVersion: string | null;
    projectUuid: string | null;
    isLinked: boolean;
    isTransformed: boolean;
    isFullySetUp: boolean;
    hasMiddleware: boolean;
    hasProxy: boolean;
    hasOpenNextDep: boolean;
  };
  config: {
    storeHash: ResolvedValue;
    accessToken: ResolvedValue;
    projectUuid: ResolvedValue;
    // Top-level keys present in .bigcommerce/project.json (names only — values
    // are never included so masked secrets like accessToken can't leak).
    projectJsonKeys: string[];
    // Names of persisted deployment env vars (project.json `env` map keys only).
    storedEnvKeys: string[];
    // Reported env var name -> where it resolved from ('unset' if nowhere).
    // The value is never included, only the source.
    envVars: Record<string, ConfigSource>;
  };
  telemetry: {
    enabled: boolean;
    correlationId: string;
  };
  // Relative path -> whether the file/directory exists on disk. Presence only;
  // contents are never read into the report.
  files: Record<string, boolean>;
}

export interface CollectDiagnosticsOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

// A value counts as present only when it is a non-empty, non-whitespace string —
// mirroring how the build treats "" the same as unset (see required-build-env.ts).
const hasValue = (value: string | undefined): boolean => value !== undefined && value.trim() !== '';

interface EnvLayer {
  source: EnvSource;
  values: Record<string, string | undefined>;
}

// Build the ordered env layers the CLI resolves against: the real environment
// first, then the auto-loaded env files. File values are parsed into memory
// only to detect presence — they are never surfaced in the report.
const buildEnvLayers = (cwd: string, env: NodeJS.ProcessEnv): EnvLayer[] => {
  const layers: EnvLayer[] = [{ source: 'process.env', values: env }];

  ENV_FILES.forEach((file) => {
    const path = join(cwd, file);

    if (!existsSync(path)) {
      return;
    }

    try {
      layers.push({ source: file, values: parse(readFileSync(path, 'utf-8')) });
    } catch {
      // A malformed/unreadable env file shouldn't break the report.
    }
  });

  return layers;
};

// The first layer (process.env > .env.local > .env) that carries a non-empty
// value for any of the given keys. Returns only the source — never a value.
const resolveEnvSource = (layers: EnvLayer[], ...keys: string[]): EnvSource | undefined =>
  layers.find((layer) => keys.some((key) => hasValue(layer.values[key])))?.source;

// Resolve which source (if any) supplies a credential, without exposing the
// value itself. Env layers win over project.json, matching build/deploy.
const resolveValue = (
  envSource: EnvSource | undefined,
  configValue: string | undefined,
): ResolvedValue => {
  if (envSource) {
    return { present: true, source: envSource };
  }

  if (hasValue(configValue)) {
    return { present: true, source: 'project.json' };
  }

  return { present: false, source: 'unset' };
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

// Detect the project's package manager from its lockfile, falling back to the
// manager that invoked the CLI when no lockfile is present.
const detectProjectPackageManager = (cwd: string): PackageManager => {
  const match = PROJECT_LOCKFILES.find(([file]) => existsSync(join(cwd, file)));

  return match ? match[1] : detectPackageManager();
};

// An open object schema: known credential fields plus any other keys the file
// may carry, all kept as `unknown` so we can enumerate key names without
// coercing (or trusting the type of) their values.
const projectJsonSchema = z.looseObject({});

const safeReadJson = (path: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
};

// Read .bigcommerce/project.json as a raw object without going through
// getProjectConfig() — that instantiates Conf and would create .bigcommerce/ as
// a side effect (see project-state.ts). Returns null when absent, malformed, or
// not a JSON object.
const readProjectJson = (cwd: string): Record<string, unknown> | null => {
  const result = projectJsonSchema.safeParse(
    safeReadJson(join(cwd, '.bigcommerce', 'project.json')),
  );

  return result.success ? result.data : null;
};

// Mirrors upgrade.ts: `catalyst.version` is the source of truth for the core
// version, falling back to the plain `version`. `name` identifies which
// Catalyst family the project is on (e.g. @bigcommerce/catalyst-core).
const corePackageSchema = z.looseObject({
  name: z.string().optional(),
  version: z.string().optional(),
  catalyst: z.looseObject({ version: z.string().optional() }).optional(),
});

const readCoreInfo = (cwd: string): { name: string | null; version: string | null } => {
  const result = corePackageSchema.safeParse(safeReadJson(join(cwd, 'package.json')));

  if (!result.success) {
    return { name: null, version: null };
  }

  return {
    name: result.data.name ?? null,
    version: result.data.catalyst?.version ?? result.data.version ?? null,
  };
};

const readStoredEnvKeys = (projectJson: Record<string, unknown> | null): string[] => {
  const env = projectJson?.env;

  if (typeof env === 'object' && env !== null && !Array.isArray(env)) {
    return Object.keys(env).sort();
  }

  return [];
};

// Gather a diagnostic snapshot of the CLI, runtime, project, and config state.
// By construction this never includes secret values — credentials are reported
// as presence + source only, and file/env checks report existence only.
export function collectDiagnostics({
  cwd = process.cwd(),
  env = process.env,
}: CollectDiagnosticsOptions = {}): Diagnostics {
  const state = getProjectState(cwd);
  const telemetry = getTelemetry();
  const projectJson = readProjectJson(cwd);
  const envLayers = buildEnvLayers(cwd, env);
  const core = readCoreInfo(cwd);

  return {
    cli: {
      name: PACKAGE_INFO.name,
      version: PACKAGE_INFO.version,
    },
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      osRelease: release(),
      packageManager: detectProjectPackageManager(cwd),
    },
    project: {
      cwd,
      coreName: core.name,
      coreVersion: core.version,
      projectUuid: state.projectUuid ?? null,
      isLinked: state.isLinked,
      isTransformed: state.isTransformed,
      isFullySetUp: state.isFullySetUp,
      hasMiddleware: state.hasMiddleware,
      hasProxy: state.hasProxy,
      hasOpenNextDep: state.hasOpenNextDep,
    },
    config: {
      storeHash: resolveValue(
        resolveEnvSource(envLayers, 'CATALYST_STORE_HASH', 'BIGCOMMERCE_STORE_HASH'),
        asString(projectJson?.storeHash),
      ),
      accessToken: resolveValue(
        resolveEnvSource(envLayers, 'CATALYST_ACCESS_TOKEN'),
        asString(projectJson?.accessToken),
      ),
      projectUuid: resolveValue(
        resolveEnvSource(envLayers, 'CATALYST_PROJECT_UUID'),
        asString(projectJson?.projectUuid),
      ),
      projectJsonKeys: projectJson ? Object.keys(projectJson).sort() : [],
      storedEnvKeys: readStoredEnvKeys(projectJson),
      envVars: Object.fromEntries(
        REPORTED_ENV_VARS.map((name) => [name, resolveEnvSource(envLayers, name) ?? 'unset']),
      ),
    },
    telemetry: {
      enabled: telemetry.isEnabled(),
      correlationId: telemetry.correlationId,
    },
    files: {
      '.env.local': existsSync(join(cwd, '.env.local')),
      '.env': existsSync(join(cwd, '.env')),
      '.bigcommerce/project.json': existsSync(join(cwd, '.bigcommerce', 'project.json')),
      '.bigcommerce/wrangler.jsonc': existsSync(join(cwd, '.bigcommerce', 'wrangler.jsonc')),
      '.open-next/': existsSync(join(cwd, '.open-next')),
      'package.json': existsSync(join(cwd, 'package.json')),
    },
  };
}
