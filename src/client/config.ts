export interface Config {
  storeHash: string;
  accessToken: string;
  channelId: number;
}

export class ClientConfig {
  readonly storeHash: string;
  readonly accessToken: string;
  readonly channelId: number;

  constructor(config: Partial<Config>) {
    this.validateConfig(config);

    this.storeHash = config.storeHash;
    this.accessToken = config.accessToken;
    this.channelId = config.channelId;

    return this;
  }

  private validateConfig(config: Partial<Config>): asserts config is Config {
    [this.validateStoreHash, this.validateAccessToken, this.validateChannelId].forEach(
      (validator) => validator(config),
    );
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
}
