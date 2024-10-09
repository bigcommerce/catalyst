import { execSync } from 'child_process';

import { isExecException } from './is-exec-exception';

export function hasGitHubSSH(): boolean {
  try {
    // Attempt to connect to GitHub via SSH and capture the output
    const output = execSync('ssh -T git@github.com', {
      encoding: 'utf8',
      stdio: 'pipe',
    }).toString();

    // Check the output for successful authentication
    return output.includes('successfully authenticated');
  } catch (error: unknown) {
    // Use the type guard to check if error is an ExecException
    if (isExecException(error)) {
      const stdout = error.stdout ? error.stdout.toString() : '';
      const stderr = error.stderr ? error.stderr.toString() : '';
      const combinedOutput = stdout + stderr;

      // Check if the output indicates successful authentication
      if (combinedOutput.includes('successfully authenticated')) {
        return true;
      }
    }

    return false;
  }
}
