import { CodegenConfig } from '@graphql-codegen/cli';

export const graphqlApiDomain: string =
  process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

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
    return `https://store-${storeHash}.${graphqlApiDomain}/graphql`;
  }

  return `https://store-${storeHash}-${channelId}.${graphqlApiDomain}/graphql`;
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
  documents: ['client/queries/**/*.ts', 'client/mutations/**/*.ts', 'client/fragments/**/*.ts'],
  generates: {
    './client/generated/': {
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
