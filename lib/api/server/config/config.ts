export interface Config {
  accessToken: string;
  apiUrl: string;
  canonicalDomainName: string;
  channelId: number;
  storeHash: string;
}

export class ClientConfig {
  readonly accessToken: string;
  readonly apiUrl: string;
  readonly canonicalDomainName: string;
  readonly channelId: number;
  readonly storeHash: string;

  constructor(config: Partial<Config>) {
    this.apiUrl = config.apiUrl ?? 'https://api.bigcommerce.com';
    this.canonicalDomainName = config.canonicalDomainName ?? 'mybigcommerce.com';

    this.validateConfig(config);

    this.accessToken = config.accessToken;
    this.channelId = config.channelId;
    this.storeHash = config.storeHash;

    return this;
  }

  private validateConfig(config: Partial<Config>): asserts config is Config {
    [this.validateAccessToken, this.validateChannelId, this.validateStoreHash].forEach(
      (validator) => validator(config),
    );
  }

  private validateAccessToken({ accessToken }: Partial<Config>) {
    if (!accessToken) {
      throw new Error('accessToken is required');
    }

    if (typeof accessToken !== 'string') {
      throw new Error('accessToken must be a string');
    }

    if (accessToken.length < 1) {
      throw new Error('accessToken must be at least 1 character');
    }
  }

  private validateChannelId({ channelId }: Partial<Config>) {
    if (!channelId) {
      throw new Error('channelId is required');
    }

    if (typeof channelId !== 'number') {
      throw new Error('channelId must be a number');
    }

    if (channelId < 1) {
      throw new Error('channelId must be at least 1');
    }
  }

  private validateStoreHash({ storeHash }: Partial<Config>) {
    if (!storeHash) {
      throw new Error('storeHash is required');
    }

    if (typeof storeHash !== 'string') {
      throw new Error('storeHash must be a string');
    }

    if (storeHash.length < 1) {
      throw new Error('storeHash must be at least 1 character');
    }
  }
}
