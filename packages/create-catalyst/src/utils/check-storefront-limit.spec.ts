import { checkStorefrontLimit } from './check-storefront-limit';

jest.mock('chalk', () => ({
  yellow: jest.fn((text: string) => text),
  cyan: jest.fn((text: string) => text),
}));

console.error = jest.fn();

describe('checkStorefrontLimit', () => {
  it('should return true when storefront limit is not exceeded', () => {
    const availableChannels = {
      data: [
        {
          id: 1,
          name: 'channel1',
          status: 'active',
          platform: 'bigcommerce',
        },
      ],
      meta: {},
    };

    const storeInfo = {
      features: {
        storefront_limits: {
          active: 2,
          total_including_inactive: 2,
        },
      },
    };

    const canCreateChannel = checkStorefrontLimit(availableChannels, storeInfo);

    expect(canCreateChannel).toBe(true);
  });

  it('should return false when storefront limit is exceeded', () => {
    const availableChannels = {
      data: [
        {
          id: 1,
          name: 'channel1',
          status: 'active',
          platform: 'bigcommerce',
        },
        {
          id: 2,
          name: 'channel2',
          status: 'active',
          platform: 'bigcommerce',
        },
      ],
      meta: {},
    };

    const storeInfo = {
      features: {
        storefront_limits: {
          active: 2,
          total_including_inactive: 2,
        },
      },
    };

    const canCreateChannel = checkStorefrontLimit(availableChannels, storeInfo);

    expect(canCreateChannel).toBe(false);
  });
});
