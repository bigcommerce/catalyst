import { execSync } from 'node:child_process';

import { checkoutRef } from './checkout-ref';
import { isExecException } from './is-exec-exception';

export function resetBranchToRef(repoDir: string, targetBranch: string, ref: string): void {
  try {
    // Checkout the target branch
    checkoutRef(repoDir, targetBranch);

    // Reset current branch to the specified ref
    execSync(`git reset --hard ${ref}`, {
      cwd: repoDir,
      stdio: 'inherit',
      encoding: 'utf8',
    });
    console.log(`Reset ${targetBranch} to ${ref} successfully.`);
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
        throw new Error(`Ref '${ref}' not found in the repository.`);
      } else {
        throw new Error(`Error resetting ${targetBranch} branch to ref '${ref}': ${stderr.trim()}`);
      }
    }

    if (error instanceof Error) {
      // General error handling
      throw new Error(`Error resetting ${targetBranch} branch to ref '${ref}': ${error.message}`);
    }

    // Unknown error type
    throw new Error(`Unknown error occurred while resetting ${targetBranch} branch to '${ref}'.`);
  }
}
