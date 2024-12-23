import { select } from '@inquirer/prompts';
import { BigCommerceServiceImpl, BigCommerceConfig } from '../bigcommerce';
import { Https } from '../../utils/https';

jest.mock('@inquirer/prompts');
jest.mock('../../utils/https');

describe('BigCommerceService', () => {
  let service: BigCommerceServiceImpl;
  let config: BigCommerceConfig;
  const MockHttps = Https as jest.MockedClass<typeof Https>;
  const mockSelect = select as jest.MockedFunction<typeof select>;

  beforeEach(() => {
    config = {
      bigCommerceApiUrl: 'https://api.example.com',
      bigCommerceAuthUrl: 'https://auth.example.com',
      sampleDataApiUrl: 'https://sample.example.com',
      storeHash: 'test-store',
      accessToken: 'test-token',
    };
    service = new BigCommerceServiceImpl(config);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return empty credentials when user declines login', async () => {
      mockSelect.mockResolvedValueOnce(false);

      const result = await service.login('https://auth.example.com');

      expect(result).toEqual({ storeHash: '', accessToken: '' });
    });

    it('should complete device code flow when user accepts login', async () => {
      mockSelect.mockResolvedValueOnce(true);
      const mockDeviceCode = {
        device_code: 'test-code',
        user_code: 'USER-CODE',
        verification_uri: 'https://verify.example.com',
        expires_in: 300,
        interval: 5,
      };
      const mockAuthResponse = {
        store_hash: 'new-store',
        access_token: 'new-token',
        context: 'stores/abc123',
        api_uri: 'https://api.example.com',
      };

      MockHttps.prototype.getDeviceCode.mockResolvedValueOnce(mockDeviceCode);
      MockHttps.prototype.checkDeviceCode.mockResolvedValueOnce(mockAuthResponse);

      const result = await service.login('https://auth.example.com');

      expect(result).toEqual({
        storeHash: 'new-store',
        accessToken: 'new-token',
      });
    });

    it('should throw error when device code expires', async () => {
      mockSelect.mockResolvedValueOnce(true);
      const mockDeviceCode = {
        device_code: 'test-code',
        user_code: 'USER-CODE',
        verification_uri: 'https://verify.example.com',
        expires_in: 10,
        interval: 5,
      };

      MockHttps.prototype.getDeviceCode.mockResolvedValueOnce(mockDeviceCode);
      MockHttps.prototype.checkDeviceCode.mockRejectedValue(new Error('Not authorized'));

      await expect(service.login('https://auth.example.com'))
        .rejects
        .toThrow('Device code expired. Please try again.');
    });
  });

  describe('createChannel', () => {
    it('should create channel and set up menus', async () => {
      const mockChannelResponse = {
        data: {
          id: 123,
          name: 'Test Channel',
          storefront_api_token: 'channel-token',
        },
      };

      MockHttps.prototype.createChannel.mockResolvedValueOnce(mockChannelResponse);
      MockHttps.prototype.createChannelMenus.mockResolvedValueOnce(undefined);

      const result = await service.createChannel('Test Channel');

      expect(result).toEqual({
        id: 123,
        token: 'channel-token',
      });
      expect(MockHttps.prototype.createChannelMenus).toHaveBeenCalledWith(123);
    });
  });

  describe('getChannels', () => {
    it('should return sorted channels', async () => {
      const mockChannelsResponse = {
        data: [
          { id: 1, name: 'Channel 1', platform: 'bigcommerce', status: 'active' },
          { id: 2, name: 'Channel 2', platform: 'catalyst', status: 'active' },
          { id: 3, name: 'Channel 3', platform: 'next', status: 'active' },
        ],
        meta: {},
      };

      MockHttps.prototype.channels.mockResolvedValueOnce(mockChannelsResponse);

      const result = await service.getChannels();

      expect(result).toEqual([
        { id: 2, name: 'Channel 2', platform: 'catalyst' },
        { id: 3, name: 'Channel 3', platform: 'next' },
        { id: 1, name: 'Channel 1', platform: 'bigcommerce' },
      ]);
    });
  });

  describe('checkEligibility', () => {
    it('should return eligibility status', async () => {
      const mockEligibilityResponse = {
        data: {
          eligible: true,
          message: 'Store is eligible',
        },
      };

      MockHttps.prototype.checkEligibility.mockResolvedValueOnce(mockEligibilityResponse);

      const result = await service.checkEligibility();

      expect(result).toEqual({
        eligible: true,
        message: 'Store is eligible',
      });
    });
  });
}); 