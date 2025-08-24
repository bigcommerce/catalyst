// @ts-check
const { generateSchema, generateOutput } = require('@gql.tada/cli-utils');
const { join } = require('path');

const graphqlApiDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

const getStoreHash = () => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  return storeHash || null;
};

const getChannelId = () => {
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  return channelId;
};

const getToken = () => {
  const token = process.env.BIGCOMMERCE_STOREFRONT_TOKEN;

  return token || null;
};

const getEndpoint = () => {
  const storeHash = getStoreHash();
  const channelId = getChannelId();

  // If no store hash is available, use the public fallback endpoint
  if (!storeHash) {
    return 'https://cxm-prd.bigcommerceapp.com/api/graphql-schema';
  }

  // Not all sites have the channel-specific canonical URL backfilled.
  // Wait till MSF-2643 is resolved before removing and simplifying the endpoint logic.
  if (!channelId || channelId === '1') {
    return `https://store-${storeHash}.${graphqlApiDomain}/graphql`;
  }

  return `https://store-${storeHash}-${channelId}.${graphqlApiDomain}/graphql`;
};

const generate = async () => {
  try {
    const endpoint = getEndpoint();
    const token = getToken();
    
    // Only include authorization header if we have a token (i.e., not using fallback endpoint)
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    await generateSchema({
      input: endpoint,
      headers,
      output: join(__dirname, '../bigcommerce.graphql'),
      tsconfig: undefined,
    });

    await generateOutput({
      disablePreprocessing: false,
      output: undefined,
      tsconfig: undefined,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

generate();
