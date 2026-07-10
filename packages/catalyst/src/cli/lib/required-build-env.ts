import { UserActionableError } from './errors';

// Env vars the core storefront build genuinely asserts on. Without these the
// OpenNext/Next.js build fails deep inside prerendering with a raw stack trace
// (empty storefront token/store hash make Storefront API calls fail; a missing
// AUTH_SECRET throws "AUTH_SECRET is not set" during static generation). These
// are the values with no default in core/.env.example that the app reads at
// build time — see core/client/index.ts and core/auth/anonymous-session.ts.
export const REQUIRED_BUILD_ENV_VARS = [
  'BIGCOMMERCE_STORE_HASH',
  'BIGCOMMERCE_STOREFRONT_TOKEN',
  'AUTH_SECRET',
] as const;

// A var counts as missing when it's unset or only whitespace — the core reads
// most of these with a `?? ''` fallback, so an empty value fails just as
// cryptically as an absent one.
export const findMissingBuildEnv = (env: NodeJS.ProcessEnv = process.env): string[] => {
  return REQUIRED_BUILD_ENV_VARS.filter((name) => {
    const value = env[name];

    return value === undefined || value.trim() === '';
  });
};

// Fail fast with a clear, actionable message before we shell out to the build.
// Naming the missing vars (and pointing at `--env-path`/`.env.local`) turns an
// "ugly build error" into something the user can act on immediately.
export const assertRequiredBuildEnv = (env: NodeJS.ProcessEnv = process.env): void => {
  const missing = findMissingBuildEnv(env);

  if (missing.length === 0) {
    return;
  }

  const missingList = missing.map((name) => `  - ${name}`).join('\n');

  throw new UserActionableError(
    `Missing required environment variable${missing.length === 1 ? '' : 's'} for the build:\n` +
      `${missingList}\n\n` +
      'These are read by the build itself, so they must be present in your ' +
      'environment before it runs. If your values live in a `.env.local` file, ' +
      'load it with `--env-path` — for example:\n' +
      '  catalyst deploy --env-path .env.local\n' +
      "If you're running from a subdirectory, point at the project root instead " +
      '(e.g. `--env-path ../.env.local`).',
  );
};
