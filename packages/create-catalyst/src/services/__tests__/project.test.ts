import { input } from '@inquirer/prompts';
import { ProjectServiceImpl } from '../project';
import { GitService, BigCommerceService, ValidationError } from '../../types';

jest.mock('@inquirer/prompts');
jest.mock('child_process');

describe('ProjectService', () => {
  let projectService: ProjectServiceImpl;
  let mockGitService: jest.Mocked<GitService>;
  let mockBigCommerceService: jest.Mocked<BigCommerceService>;
  const mockInput = input as jest.MockedFunction<typeof input>;

  beforeEach(() => {
    mockGitService = {
      clone: jest.fn(),
      checkoutRef: jest.fn(),
      resetBranchToRef: jest.fn(),
      hasGitHubSSH: jest.fn(),
    };

    mockBigCommerceService = {
      login: jest.fn(),
      createChannel: jest.fn(),
      getChannels: jest.fn(),
      checkEligibility: jest.fn(),
    };

    projectService = new ProjectServiceImpl(mockGitService, mockBigCommerceService);
  });

  describe('create', () => {
    it('should create a new project with default settings', async () => {
      mockInput.mockResolvedValueOnce('test-project');
      mockBigCommerceService.login.mockResolvedValueOnce({
        storeHash: 'test-store',
        accessToken: 'test-token',
      });

      await projectService.create({
        projectDir: process.cwd(),
      });

      expect(mockGitService.clone).toHaveBeenCalledWith(
        'bigcommerce/catalyst',
        'test-project',
        expect.any(String),
      );
    });

    it('should throw validation error for invalid project directory', async () => {
      await expect(projectService.create({
        projectDir: '/invalid/directory',
      })).rejects.toThrow(ValidationError);
    });

    it('should use provided project name and store credentials', async () => {
      await projectService.create({
        projectName: 'my-project',
        projectDir: process.cwd(),
        storeHash: 'store123',
        accessToken: 'token123',
        channelId: '456',
        storefrontToken: 'sf-token',
      });

      expect(mockGitService.clone).toHaveBeenCalledWith(
        'bigcommerce/catalyst',
        'my-project',
        expect.any(String),
      );
    });

    it('should handle git reference options', async () => {
      mockInput.mockResolvedValueOnce('test-project');

      await projectService.create({
        projectDir: process.cwd(),
        ghRef: 'v1.0.0',
        resetMain: true,
      });

      expect(mockGitService.checkoutRef).toHaveBeenCalledWith(expect.any(String), 'main');
      expect(mockGitService.resetBranchToRef).toHaveBeenCalledWith(expect.any(String), 'v1.0.0');
    });
  });

  describe('init', () => {
    it('should initialize project with store connection', async () => {
      mockBigCommerceService.login.mockResolvedValueOnce({
        storeHash: 'test-store',
        accessToken: 'test-token',
      });
      mockBigCommerceService.checkEligibility.mockResolvedValueOnce({
        eligible: true,
        message: 'Store is eligible',
      });
      mockBigCommerceService.createChannel.mockResolvedValueOnce({
        id: 123,
        token: 'channel-token',
      });
      mockInput.mockResolvedValueOnce('Test Channel');

      await projectService.init({});

      expect(mockBigCommerceService.checkEligibility).toHaveBeenCalled();
      expect(mockBigCommerceService.createChannel).toHaveBeenCalledWith('Test Channel');
    });

    it('should use provided store credentials', async () => {
      mockBigCommerceService.checkEligibility.mockResolvedValueOnce({
        eligible: true,
        message: 'Store is eligible',
      });
      mockBigCommerceService.createChannel.mockResolvedValueOnce({
        id: 123,
        token: 'channel-token',
      });
      mockInput.mockResolvedValueOnce('Test Channel');

      await projectService.init({
        storeHash: 'store123',
        accessToken: 'token123',
      });

      expect(mockBigCommerceService.login).not.toHaveBeenCalled();
    });

    it('should handle ineligible stores', async () => {
      mockBigCommerceService.login.mockResolvedValueOnce({
        storeHash: 'test-store',
        accessToken: 'test-token',
      });
      mockBigCommerceService.checkEligibility.mockResolvedValueOnce({
        eligible: false,
        message: 'Store is not eligible',
      });
      mockInput.mockResolvedValueOnce('Test Channel');
      mockBigCommerceService.createChannel.mockResolvedValueOnce({
        id: 123,
        token: 'channel-token',
      });

      await projectService.init({});

      expect(mockBigCommerceService.createChannel).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should validate project name', () => {
      expect(projectService.validateProjectName('valid-name')).toBe(true);
      expect(projectService.validateProjectName('')).toBe(false);
    });

    it('should validate project directory', () => {
      expect(projectService.validateProjectDir(process.cwd())).toBe(true);
      expect(projectService.validateProjectDir('/invalid/directory')).toBe(false);
    });
  });
}); 