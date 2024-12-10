import { execSync } from 'node:child_process';

import { isExecException } from './is-exec-exception';

export function checkoutRef(repoDir: string, ref: string): void {
  try {
    // Attempt to checkout the specified ref
    execSync(`git checkout ${ref}`, {
      cwd: repoDir,
      stdio: 'inherit',
      encoding: 'utf8',
    });
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
    }

    if (error instanceof Error) {
      // General error handling
      console.error(`Error checking out ref '${ref}':`, error.message);
    }

    // Unknown error type
    console.error(`Unknown error occurred while checking out ref '${ref}'.`);
  }
}
