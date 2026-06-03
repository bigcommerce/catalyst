import type Conf from 'conf';

import { ProjectConfigSchema } from './project-config';

// A single deployment environment variable as the infrastructure API expects
// it. We only persist/send `secret` vars today (see ProjectConfigSchema.env).
export interface DeploymentSecret {
  type: 'secret';
  key: string;
  value: string;
}

// Matches POSIX-ish env var names: leading letter/underscore, then
// letters/digits/underscores. Keeps the stored config (and the deployment
// payload) free of keys that wouldn't be valid env vars at runtime.
const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Parse a single `KEY=VALUE` assignment. Splits on the *first* `=` only, so
// values containing `=` (e.g. base64 or tokens) survive intact. Validates the
// key shape and rejects empty values.
export const parseEnvAssignment = (input: string): { key: string; value: string } => {
  const separatorIndex = input.indexOf('=');

  if (separatorIndex === -1) {
    throw new Error(`Invalid env var format: ${input}. Expected format: KEY=VALUE`);
  }

  const key = input.slice(0, separatorIndex).trim();
  const value = input.slice(separatorIndex + 1).trim();

  if (!key || !value) {
    throw new Error(`Invalid env var format: ${input}. Expected format: KEY=VALUE`);
  }

  if (!ENV_KEY_PATTERN.test(key)) {
    throw new Error(
      `Invalid env var name: ${key}. Names must start with a letter or underscore and contain only letters, numbers, and underscores.`,
    );
  }

  return { key, value };
};

// Read the persisted env var map (KEY -> VALUE), defaulting to empty.
export const getStoredEnv = (config: Conf<ProjectConfigSchema>): Record<string, string> => {
  return config.get('env') ?? {};
};

// Convert a persisted env var map into the deployment `secret` payload shape.
export const toDeploymentSecrets = (envVars: Record<string, string>): DeploymentSecret[] => {
  return Object.entries(envVars).map(([key, value]) => ({ type: 'secret', key, value }));
};

// Merge persisted secrets with inline `--secret` flag secrets, keyed by name.
// Inline flags win on conflict so users can override a stored value per-run.
export const mergeDeploymentSecrets = (
  persisted: DeploymentSecret[],
  flagSecrets: DeploymentSecret[],
): DeploymentSecret[] => {
  const byKey = new Map<string, DeploymentSecret>();

  persisted.forEach((secret) => byKey.set(secret.key, secret));
  flagSecrets.forEach((secret) => byKey.set(secret.key, secret));

  return Array.from(byKey.values());
};
