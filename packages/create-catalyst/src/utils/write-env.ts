import { outputFileSync } from 'fs-extra/esm';
import { join } from 'path';

export const writeEnv = (projectDir: string, envVars: Record<string, string>) => {
  outputFileSync(
    join(projectDir, '.env.local'),
    `${Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')}\n`,
  );
};
