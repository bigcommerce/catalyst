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

export async function getActivePromotions() {
  const promotions = await getPromotions();
  return promotions.filter((promotion: any) => promotion.status === 'ENABLED' 
    && ['COUPON', 'AUTOMATIC'].includes(promotion.redemption_type)
    && !promotion.name.toLowerCase().includes('passive') 
    && (promotion.start_date === null || new Date(promotion.start_date) < new Date())
    && (promotion.end_date === null || new Date(promotion.end_date) > new Date()));
}