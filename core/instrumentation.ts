import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'catalyst',
    attributes: { storeHash: process.env.BIGCOMMERCE_STORE_HASH },
  });
}
