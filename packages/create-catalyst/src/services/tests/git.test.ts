import { execSync } from 'child_process';

import { GitServiceImpl } from '../git';

jest.mock('child_process');

describe('GitService', () => {
  const service = new GitServiceImpl();
  const mockExecSync = jest.mocked(execSync);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clone', () => {
    it('should clone a repository with HTTPS', () => {
      mockExecSync.mockReturnValueOnce(Buffer.from(''));

      service.clone('bigcommerce/catalyst', 'my-project', '/path/to/project');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git clone https://github.com/bigcommerce/catalyst.git my-project',
        { stdio: 'inherit' },
      );
    });

    it('should clone a repository with SSH if available', () => {
      mockExecSync.mockReturnValueOnce(Buffer.from('successfully authenticated'));

      service.clone('bigcommerce/catalyst', 'my-project', '/path/to/project');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git clone git@github.com:bigcommerce/catalyst.git my-project',
        { stdio: 'inherit' },
      );
    });
  });

  describe('checkoutRef', () => {
    it('should checkout a ref', () => {
      service.checkoutRef('/path/to/project', 'main');

      expect(mockExecSync).toHaveBeenCalledWith('git checkout main', {
        cwd: '/path/to/project',
        stdio: 'inherit',
        encoding: 'utf8',
      });
    });
  });

  describe('resetBranchToRef', () => {
    it('should reset a branch to a ref', () => {
      service.resetBranchToRef('/path/to/project', 'main');

      expect(mockExecSync).toHaveBeenCalledWith('git reset --hard main', {
        cwd: '/path/to/project',
        stdio: 'inherit',
        encoding: 'utf8',
      });
    });
  });

  describe('hasGitHubSSH', () => {
    it('should return true if SSH is configured', () => {
      mockExecSync.mockReturnValueOnce(Buffer.from('successfully authenticated'));

      const result = service.hasGitHubSSH();

      expect(result).toBe(true);
    });

    it('should return true if SSH is configured but command fails with success message', () => {
      const error = new Error('Command failed');

      Object.assign(error, {
        stdout: 'successfully authenticated',
        stderr: '',
      });

      mockExecSync.mockImplementationOnce(() => {
        throw error;
      });

      const result = service.hasGitHubSSH();

      expect(result).toBe(true);
    });

    it('should return false if SSH is not configured', () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });

      const result = service.hasGitHubSSH();

      expect(result).toBe(false);
    });
  });
});
