if (!process.env.BIGCOMMERCE_STOREFRONT_TOKEN) {
  throw new Error('The environment variable BIGCOMMERCE_STOREFRONT_TOKEN is missing');
}

if (!process.env.BIGCOMMERCE_STOREFRONT_DOMAIN) {
  throw new Error('The environment variable BIGCOMMERCE_STOREFRONT_DOMAIN is missing');
}

if (!process.env.BIGCOMMERCE_STORE_HASH) {
  throw new Error('The environment variable BIGCOMMERCE_STORE_HASH is missing');
}

if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
  throw new Error('The environment variable BIGCOMMERCE_ACCESS_TOKEN is missing');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: process.env.BIGCOMMERCE_CDN_HOSTNAME ?? '*.bigcommerce.com',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
