import { sync as spawnSync } from 'cross-spawn';

import { isExecException } from './is-exec-exception';
import { consola } from './logger';

export function checkoutRef(repoDir: string, ref: string): void {
  try {
    const spawn = spawnSync('git', ['checkout', ref, '--'], {
      cwd: repoDir,
      encoding: 'utf8',
      shell: false,
    });

    const stderr = spawn.stderr.trim();

    if (spawn.status !== 0 && stderr) {
      throw new Error(stderr);
    }

    consola.success(`Checked out ref ${ref} successfully.`);
  } catch (error: unknown) {
    if (isExecException(error)) {
      const stderr = error.stderr ? error.stderr.toString() : '';

      if (
        stderr.includes(`fatal: reference is not a tree: ${ref}`) ||
        stderr.includes(`fatal: ambiguous argument '${ref}'`) ||
        stderr.includes(`unknown revision or path not in the working tree`)
      ) {
        consola.error(`Ref '${ref}' not found in the repository.`);
      } else {
        consola.error(`Error checking out ref '${ref}':`, stderr.trim());
      }
    } else if (error instanceof Error) {
      consola.error(`Error checking out ref '${ref}':`, error.message);
    } else {
      consola.error(`Unknown error occurred while checking out ref '${ref}'.`);
    }

    consola.warn(`Falling back to the default branch.`);
  }
}
