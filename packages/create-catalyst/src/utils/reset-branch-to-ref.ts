import { execSync } from 'node:child_process';

import { checkoutRef } from './checkout-ref';
import { isExecException } from './is-exec-exception';

export function resetBranchToRef(repoDir: string, targetBranch: string, ref: string): void {
  try {
    // Checkout the target branch
    const checkoutSuccess = checkoutRef(repoDir, targetBranch);

    // Reset current branch to the specified ref
    if (checkoutSuccess) {
      execSync(`git reset --hard ${ref}`, {
        cwd: repoDir,
        stdio: 'inherit',
        encoding: 'utf8',
      });
      console.log(`Reset ${targetBranch} to ${ref} successfully.`);
    }
  } catch (error: unknown) {
    // Handle the error safely according to ESLint rules
    if (isExecException(error)) {
      const stderr = error.stderr ? error.stderr.toString() : '';

      console.error(`Error resetting ${targetBranch} branch to ref '${ref}':`, stderr.trim());
    }

    if (error instanceof Error) {
      // General error handling
      console.error(`Error resetting ${targetBranch} branch to ref '${ref}':`, error.message);
    }

    // Unknown error type
    console.error(`Unknown error occurred while resetting ${targetBranch} branch to '${ref}'.`);
  }
}
