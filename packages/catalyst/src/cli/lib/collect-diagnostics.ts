import { existsSync, readFileSync } from 'node:fs';
import { release } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

import PACKAGE_INFO from '../../../package.json';

import { detectPackageManager, type PackageManager } from './detect-package-manager';
import { getProjectState } from './project-state';
import { getTelemetry } from './telemetry';

// Env vars the CLI reads (see the config-priority chain in program.ts and
// required-build-env.ts). We report only whether each is SET — never its value —
// so the diagnostic report can never leak a token, secret, or store identifier.
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

// Where a resolved config value came from, following the CLI's priority chain
// (process.env > .bigcommerce/project.json). Flags are excluded because `debug`
// takes none of the credential flags itself.
export type ConfigSource = 'process.env' | 'project.json' | 'unset';

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
    // Reported env var name -> whether it is set (never the value).
    envVars: Record<string, boolean>;
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

// Resolve which source (if any) supplies a credential, without exposing the
// value itself. process.env wins over project.json, matching program.ts.
const resolveValue = (
  envValue: string | undefined,
  configValue: string | undefined,
): ResolvedValue => {
  if (hasValue(envValue)) {
    return { present: true, source: 'process.env' };
  }

  if (hasValue(configValue)) {
    return { present: true, source: 'project.json' };
  }

  return { present: false, source: 'unset' };
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

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

  const storeHashEnv = env.CATALYST_STORE_HASH ?? env.BIGCOMMERCE_STORE_HASH;

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
      packageManager: detectPackageManager(),
    },
    project: {
      cwd,
      projectUuid: state.projectUuid ?? null,
      isLinked: state.isLinked,
      isTransformed: state.isTransformed,
      isFullySetUp: state.isFullySetUp,
      hasMiddleware: state.hasMiddleware,
      hasProxy: state.hasProxy,
      hasOpenNextDep: state.hasOpenNextDep,
    },
    config: {
      storeHash: resolveValue(storeHashEnv, asString(projectJson?.storeHash)),
      accessToken: resolveValue(env.CATALYST_ACCESS_TOKEN, asString(projectJson?.accessToken)),
      projectUuid: resolveValue(env.CATALYST_PROJECT_UUID, asString(projectJson?.projectUuid)),
      projectJsonKeys: projectJson ? Object.keys(projectJson).sort() : [],
      storedEnvKeys: readStoredEnvKeys(projectJson),
      envVars: Object.fromEntries(REPORTED_ENV_VARS.map((name) => [name, hasValue(env[name])])),
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
