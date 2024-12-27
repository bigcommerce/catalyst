import { execSync } from 'child_process';

import { GitService } from '../types';

export class GitServiceImpl implements GitService {
  clone(repository: string, projectName: string, projectDir: string): void {
    const useSSH = this.hasGitHubSSH();
    const protocol = useSSH ? 'git@github.com:' : 'https://github.com/';
    const cloneCommand = `git clone ${protocol}${repository}.git${projectName ? ` ${projectName}` : ''}`;

    execSync(cloneCommand, { stdio: 'inherit' });

    // Check if 'origin' remote exists before trying to rename it
    try {
      execSync('git remote get-url origin', { cwd: projectDir, stdio: 'ignore' });
      execSync('git remote rename origin upstream', { cwd: projectDir, stdio: 'inherit' });
    } catch {
      // If 'origin' doesn't exist, we don't need to rename it
      console.log('Note: No origin remote found to rename');
    }
  }

  checkoutRef(projectDir: string, ref: string): void {
    try {
      execSync(`git checkout ${ref}`, {
        cwd: projectDir,
        stdio: 'inherit',
        encoding: 'utf8',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to checkout ref ${ref}: ${error.message}`);
      }

      throw error;
    }
  }

  resetBranchToRef(projectDir: string, ref: string): void {
    try {
      execSync(`git reset --hard ${ref}`, {
        cwd: projectDir,
        stdio: 'inherit',
        encoding: 'utf8',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to reset branch to ref ${ref}: ${error.message}`);
      }

      throw error;
    }
  }

  hasGitHubSSH(): boolean {
    try {
      const output = execSync('ssh -T git@github.com', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      return output.includes('successfully authenticated');
    } catch (error) {
      // SSH test command returns non-zero exit code even on success
      if (this.isErrorWithOutput(error)) {
        const combinedOutput = error.stdout + error.stderr;

        return combinedOutput.includes('successfully authenticated');
      }

      return false;
    }
  }

  private isErrorWithOutput(error: unknown): error is Error & { stdout: string; stderr: string } {
    if (!(error instanceof Error)) return false;
    if (!('stdout' in error)) return false;
    if (!('stderr' in error)) return false;

    const { stdout, stderr } = error;

    return typeof stdout === 'string' && typeof stderr === 'string';
  }
}
