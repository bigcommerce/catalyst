const VERSION = 'v3';

export const STORE_STATUS_KEY = 'storeStatus';

export const kvKey = (key: string, channelId?: string) => {
  const namespace = process.env.KV_NAMESPACE ?? process.env.BIGCOMMERCE_STORE_HASH ?? 'store';
  const id = channelId ?? process.env.BIGCOMMERCE_CHANNEL_ID ?? '1';

  return `${namespace}_${id}_${VERSION}_${key}`;
};
