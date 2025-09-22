// @ts-check
const { generateSchema, generateOutput } = require('@gql.tada/cli-utils');
const { config } = require('dotenv');
const { existsSync } = require('fs');
const { join } = require('path');

/**
 * Load environment variables from the given file if present.
 * @param {string} relativePath
 */
const loadEnvIfPresent = (relativePath) => {
  const filePath = join(__dirname, relativePath);

  if (existsSync(filePath)) {
    config({ path: filePath, override: false });
  }
};

['../.env.local', '../.env'].forEach(loadEnvIfPresent);

const graphqlApiDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

/**
 * @returns {string}
 */
const getStoreHash = () => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!storeHash) {
    throw new Error('Missing store hash');
  }

  return storeHash;
};

/**
 * @returns {string | undefined}
 */
const getChannelId = () => {
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  return channelId;
};

/**
 * @returns {string}
 */
const getToken = () => {
  const token = process.env.BIGCOMMERCE_STOREFRONT_TOKEN;

  if (!token) {
    throw new Error('Missing storefront token');
  }

  return token;
};

/**
 * @returns {string}
 */
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

/**
 * @returns {Promise<void>}
 */
const generate = async () => {
  try {
    await generateSchema({
      input: getEndpoint(),
      headers: { Authorization: `Bearer ${getToken()}` },
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
