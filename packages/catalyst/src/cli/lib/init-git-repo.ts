import { execSync } from 'child_process';
import { rmSync } from 'fs';
import { join } from 'path';

import { consola } from './logger';

const run = (command: string, cwd: string) => execSync(command, { cwd, stdio: 'ignore' });

// Initialize a fresh git repository for the merchant with a single initial
// commit. We no longer clone, so there is no history or upstream remote to carry
// over — merchants add their own. Best-effort: a missing git or a pre-existing
// repo shouldn't fail project creation, so we warn and roll back a partial init.
export const initGitRepo = (projectDir: string) => {
  try {
    run('git init', projectDir);
    run('git add -A', projectDir);
    run('git commit -m "Initial commit from Catalyst"', projectDir);
    consola.success('Initialized a git repository.');
  } catch {
    rmSync(join(projectDir, '.git'), { recursive: true, force: true });
    consola.warn('Could not initialize a git repository. Skipping.');
  }
};
