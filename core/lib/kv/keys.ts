export const STORE_STATUS_KEY = 'storeStatus';
export const kvKey = (key: string, channelId?: string) =>
  `${channelId ?? process.env.BIGCOMMERCE_CHANNEL_ID ?? '1'}_${key}`;
