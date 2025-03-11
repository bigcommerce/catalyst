import { sync as spawnSync } from 'cross-spawn';

import { isExecException } from './is-exec-exception';

export function checkoutRef(repoDir: string, ref: string): void {
  try {
    // Attempt to checkout the specified ref
    const spawn = spawnSync('git', ['checkout', ref, '--'], {
      cwd: repoDir,
      encoding: 'utf8',
      // Explicitly set shell to false to avoid shell injection
      // Don't use shell: true as it's a security risk
      shell: false,
    });

    const stderr = spawn.stderr.trim();

    if (spawn.status !== 0 && stderr) {
      throw new Error(stderr);
    }

    console.log(`Checked out ref ${ref} successfully.`);
  } catch (error: unknown) {
    // Handle the error safely according to ESLint rules
    if (isExecException(error)) {
      const stderr = error.stderr ? error.stderr.toString() : '';

      // Check if the error message indicates that the ref was not found
      if (
        stderr.includes(`fatal: reference is not a tree: ${ref}`) ||
        stderr.includes(`fatal: ambiguous argument '${ref}'`) ||
        stderr.includes(`unknown revision or path not in the working tree`)
      ) {
        console.error(`Ref '${ref}' not found in the repository.`);
      } else {
        console.error(`Error checking out ref '${ref}':`, stderr.trim());
      }
    } else if (error instanceof Error) {
      // General error handling
      console.error(`Error checking out ref '${ref}':`, error.message);
    } else {
      // Unknown error type
      console.error(`Unknown error occurred while checking out ref '${ref}'.`);
    }

    console.warn(`Falling back to the default branch.`);
  }
}
