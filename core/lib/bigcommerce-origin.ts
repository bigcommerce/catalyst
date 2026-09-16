export const canonicalDomain = (): string =>
  process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

export const buildChannelOrigin = (
  storeHash: string,
  channelId: string,
  domain = canonicalDomain(),
): string => `https://store-${storeHash}-${channelId}.${domain}`;
