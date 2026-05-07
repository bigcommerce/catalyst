import { outputFileSync } from 'fs-extra/esm';
import { join } from 'path';

// Writes core/.env.local — Next.js (and all the catalyst CLI commands) read env vars
// from there, since `core/` is the package they run inside.
export const writeEnv = (projectDir: string, envVars: Record<string, string>) => {
  outputFileSync(
    join(projectDir, 'core', '.env.local'),
    `${Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')}\n`,
  );
};
