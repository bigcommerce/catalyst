const { generate } = require('@genql/cli');
const path = require('path');

const getSecrets = () => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!storeHash) {
    throw new Error('Missing store hash');
  }

  const token = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN;

  if (!token) {
    throw new Error('Missing customer impersonation token');
  }

  return {
    storeHash,
    token,
  };
};

const getChannel = () => {
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  return {
    channelId,
  };
};

const getEndpoint = () => {
  const { storeHash } = getSecrets();
  const { channelId } = getChannel();

  // Not all sites have the channel-specific canonical URL backfilled.
  // Wait till MSF-2643 is resolved before removing and simplifying the endpoint logic.
  if (!channelId || channelId === '1') {
    return `https://store-${storeHash}.mybigcommerce.com/graphql`;
  }

  return `https://store-${storeHash}-${channelId}.mybigcommerce.com/graphql`;
};

const run = async () => {
  try {
    const endpoint = getEndpoint();
    const { token } = getSecrets();

    await generate({
      endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      output: path.join(__dirname, '../generated'),
      scalarTypes: {
        DateTime: 'string',
        Long: 'number',
        BigDecimal: 'number',
      },
      sortProperties: true,
    });
    // eslint-disable-next-line no-console
    console.log('ok');
    process.exit();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

run();
