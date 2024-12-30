import { execSync } from 'child_process';
import { GitServiceImpl } from '../git';

jest.mock('child_process');

describe('GitService', () => {
  let gitService: GitServiceImpl;
  const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    gitService = new GitServiceImpl();
    jest.clearAllMocks();
  });

  describe('clone', () => {
    it('should clone repository using HTTPS when SSH is not available', async () => {
      mockExecSync.mockImplementationOnce(() => { throw new Error('SSH not available'); });

      await gitService.clone('org/repo', 'project', '/path/to/project');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git clone https://github.com/org/repo.git project',
        expect.any(Object),
      );
    });

    it('should clone repository using SSH when available', async () => {
      mockExecSync.mockReturnValueOnce(Buffer.from('successfully authenticated'));

      await gitService.clone('org/repo', 'project', '/path/to/project');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git clone git@github.com:org/repo.git project',
        expect.any(Object),
      );
    });

    it('should rename origin to upstream after cloning', async () => {
      mockExecSync.mockReturnValueOnce(Buffer.from(''));

      await gitService.clone('org/repo', 'project', '/path/to/project');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git remote rename origin upstream',
        expect.objectContaining({ cwd: '/path/to/project' }),
      );
    });
  });

  describe('checkoutRef', () => {
    it('should checkout the specified ref', async () => {
      await gitService.checkoutRef('/path/to/project', 'main');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git checkout main',
        expect.objectContaining({ cwd: '/path/to/project' }),
      );
    });

    it('should throw error when checkout fails', async () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('checkout failed');
      });

      await expect(gitService.checkoutRef('/path/to/project', 'invalid-ref'))
        .rejects
        .toThrow('Failed to checkout ref invalid-ref: checkout failed');
    });
  });

  describe('resetBranchToRef', () => {
    it('should reset branch to the specified ref', async () => {
      await gitService.resetBranchToRef('/path/to/project', 'main');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git reset --hard main',
        expect.objectContaining({ cwd: '/path/to/project' }),
      );
    });

    it('should throw error when reset fails', async () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('reset failed');
      });

      await expect(gitService.resetBranchToRef('/path/to/project', 'invalid-ref'))
        .rejects
        .toThrow('Failed to reset branch to ref invalid-ref: reset failed');
    });
  });

  describe('hasGitHubSSH', () => {
    it('should return true when SSH is configured', async () => {
      mockExecSync.mockReturnValueOnce(Buffer.from('successfully authenticated'));

      const result = await gitService.hasGitHubSSH();

      expect(result).toBe(true);
    });

    it('should return true when SSH test exits with error but authentication succeeded', async () => {
      const error = new Error('Command failed') as any;
      error.stdout = Buffer.from('successfully authenticated');
      mockExecSync.mockImplementationOnce(() => { throw error; });

      const result = await gitService.hasGitHubSSH();

      expect(result).toBe(true);
    });

    it('should return false when SSH is not configured', async () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('SSH not configured');
      });

      const result = await gitService.hasGitHubSSH();

      expect(result).toBe(false);
    });
  });
}); 