import { createClient } from './generated';

export const client = createClient({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? ''}`,
  },
  cache: 'force-cache',
});
