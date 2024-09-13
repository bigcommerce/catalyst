export async function deleteAccount(customerId: number) {
  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  if (!process.env.BIGCOMMERCE_STORE_HASH) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set');
  }

  try {
    await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/customers?id:in=${customerId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
      },
    );
  } catch (error) {
    console.error(error);
  }
}
