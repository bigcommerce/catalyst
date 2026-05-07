import { execSync } from 'child_process';

import { isExecException } from './is-exec-exception';

export function hasGitHubSSH(): boolean {
  try {
    const output = execSync('ssh -T git@github.com', {
      encoding: 'utf8',
      stdio: 'pipe',
    }).toString();

    return output.includes('successfully authenticated');
  } catch (error: unknown) {
    if (isExecException(error)) {
      const stdout = error.stdout ? error.stdout.toString() : '';
      const stderr = error.stderr ? error.stderr.toString() : '';
      const combinedOutput = stdout + stderr;

      if (combinedOutput.includes('successfully authenticated')) {
        return true;
      }
    }

    return false;
  }
}
