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

const run = async () => {
  try {
    const { storeHash, token } = getSecrets();

    await generate({
      endpoint: `https://store-${storeHash}.mybigcommerce.com/graphql`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      output: path.join(__dirname, '../src/generated'),
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
