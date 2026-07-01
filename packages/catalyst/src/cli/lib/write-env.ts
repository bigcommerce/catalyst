import { outputFileSync } from 'fs-extra/esm';
import { join } from 'path';

// Writes .env.local at the project root — Next.js (and all the catalyst CLI
// commands) read env vars from there, since the extracted project is the package
// they run inside.
export const writeEnv = (projectDir: string, envVars: Record<string, string>) => {
  outputFileSync(
    join(projectDir, '.env.local'),
    `${Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')}\n`,
  );
};
