import { execSync } from 'child_process';
import { GitService } from '../types';

export class GitServiceImpl implements GitService {
  async clone(repository: string, projectName: string, projectDir: string): Promise<void> {
    const useSSH = await this.hasGitHubSSH();
    const protocol = useSSH ? 'git@github.com:' : 'https://github.com/';
    const cloneCommand = `git clone ${protocol}${repository}.git${projectName ? ` ${projectName}` : ''}`;

    execSync(cloneCommand, { stdio: 'inherit' });
    execSync('git remote rename origin upstream', { cwd: projectDir, stdio: 'inherit' });
  }

  async checkoutRef(projectDir: string, ref: string): Promise<void> {
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

  async resetBranchToRef(projectDir: string, ref: string): Promise<void> {
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

  async hasGitHubSSH(): Promise<boolean> {
    try {
      const output = execSync('ssh -T git@github.com', {
        encoding: 'utf8',
        stdio: 'pipe',
      }).toString();

      return output.includes('successfully authenticated');
    } catch (error) {
      // SSH test command returns non-zero exit code even on success
      if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
        const stdout = (error as { stdout?: Buffer }).stdout?.toString() || '';
        const stderr = (error as { stderr?: Buffer }).stderr?.toString() || '';
        const combinedOutput = stdout + stderr;

        return combinedOutput.includes('successfully authenticated');
      }

      return false;
    }
  }
} 