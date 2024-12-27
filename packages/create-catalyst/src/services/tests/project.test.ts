import type { BigCommerceService } from '../../types';
import { GitServiceImpl } from '../git';
import { ProjectServiceImpl } from '../project';

jest.mock('../git');

describe('ProjectService', () => {
  const gitService = new GitServiceImpl();
  const mockBigCommerceService = {
    getChannels: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Test Channel',
        platform: 'catalyst' as const,
        type: 'storefront' as const,
        storefront_api_token: 'token',
        site: { url: 'https://example.com' },
      },
    ]),
    createChannel: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Channel',
      platform: 'catalyst' as const,
      type: 'storefront' as const,
      storefront_api_token: 'token',
      site: { url: 'https://example.com' },
    }),
    checkEligibility: jest.fn().mockResolvedValue({
      eligible: true,
      message: 'Store is eligible',
    }),
    login: jest.fn().mockResolvedValue({
      storeHash: 'test-store',
      accessToken: 'test-token',
    }),
    updateCredentials: jest.fn(),
  } satisfies BigCommerceService;

  const projectService = new ProjectServiceImpl(gitService, mockBigCommerceService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateProjectName', () => {
    it('should return true for valid project names', () => {
      expect(projectService.validateProjectName('my-project')).toBe(true);
      expect(projectService.validateProjectName('project123')).toBe(true);
      expect(projectService.validateProjectName('My Project')).toBe(true);
    });

    it('should return false for invalid project names', () => {
      expect(projectService.validateProjectName('')).toBe(false);
      expect(projectService.validateProjectName(' ')).toBe(false);
    });
  });
});
