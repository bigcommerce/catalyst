/** @type {import('next').NextConfig} */
const withMakeswift = require('@makeswift/runtime/next/plugin')();

const nextConfig = {
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
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

module.exports = withMakeswift(nextConfig);
