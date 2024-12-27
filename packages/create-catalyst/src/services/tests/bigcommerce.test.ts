import { BigCommerceServiceImpl } from '../bigcommerce';

describe('BigCommerceService', () => {
  const config = {
    bigCommerceApiUrl: 'https://api.bigcommerce.com',
    bigCommerceAuthUrl: 'https://login.bigcommerce.com',
    cliApiUrl: 'https://cli-api.bigcommerce.com',
  };

  const service = new BigCommerceServiceImpl(config);

  it('should initialize correctly', () => {
    expect(service).toBeInstanceOf(BigCommerceServiceImpl);
  });
});
