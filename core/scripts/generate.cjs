// @ts-check
const { generateSchema, generateOutput } = require('@gql.tada/cli-utils');
const { join } = require('path');

const graphqlApiDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
const defaultSchemaEndpoint = 'https://gql-schema-storefront.bigcommerce.tools/graphql';

const getEndpoint = () => {
  const schemaEndpoint = process.env.BIGCOMMERCE_GRAPHQL_SCHEMA_ENDPOINT ?? defaultSchemaEndpoint;
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  const token = process.env.BIGCOMMERCE_STOREFRONT_TOKEN;

  // If either store hash or token is missing, use the schema endpoint
  if (!storeHash || !token) {
    return schemaEndpoint;
  }

  // Otherwise, use the store-specific endpoint
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID || 1;
  return `https://store-${storeHash}-${channelId}.${graphqlApiDomain}/graphql`;
};

const getHeaders = () => {
  const token = process.env.BIGCOMMERCE_STOREFRONT_TOKEN;
  
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const generate = async () => {
  try {
    await generateSchema({
      input: getEndpoint(),
      headers: getHeaders(),
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
