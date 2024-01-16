import { CodegenConfig } from '@graphql-codegen/cli';

const getToken = () => {
  const token = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN;

  if (!token) {
    throw new Error('Missing customer impersonation token');
  }

  return token;
};

const getStoreHash = () => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!storeHash) {
    throw new Error('Missing store hash');
  }

  return storeHash;
};

const getChannelId = () => {
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  return channelId;
};

const getEndpoint = () => {
  const storeHash = getStoreHash();
  const channelId = getChannelId();

  // Not all sites have the channel-specific canonical URL backfilled.
  // Wait till MSF-2643 is resolved before removing and simplifying the endpoint logic.
  if (!channelId || channelId === '1') {
    return `https://store-${storeHash}.mybigcommerce.com/graphql`;
  }

  return `https://store-${storeHash}-${channelId}.mybigcommerce.com/graphql`;
};

const config: CodegenConfig = {
  schema: [
    {
      [getEndpoint()]: {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    },
  ],
  documents: [
    'clients/new/queries/**/*.ts',
    'clients/new/mutations/**/*.ts',
    'clients/new/fragments/**/*.ts',
  ],
  generates: {
    './clients/new/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: 'string',
        avoidOptionals: {
          field: true,
        },
        scalars: {
          DateTime: 'string',
          Long: 'number',
          BigDecimal: 'number',
        },
      },
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      watchPattern: '',
    },
  },
};

export default config;
