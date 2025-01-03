'use server';

const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
const client = process.env.BIGCOMMERCE_ACCESS_TOKEN || '';
const tokenRest = process.env.BIGCOMMERCE_ACCESS_TOKEN || '';
const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

export async function getPromotions() {
  const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/promotions?channels=${channelId}&sort=priority&status=ENABLED`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "X-Auth-Client": client,
      "X-Auth-Token": tokenRest,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    cache: 'force-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data.data;
}