import { createClient } from './generated';

const domain = process.env.BIGCOMMERCE_STOREFRONT_DOMAIN ?? '';
const url = `${domain}/graphql`;

export const client = createClient({
  url,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? ''}`,
  },
  cache: 'force-cache',
});
