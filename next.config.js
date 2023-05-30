/** @type {import('next').NextConfig} */
const withMakeswift = require('@makeswift/runtime/next/plugin')();

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
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
};

module.exports = withMakeswift(nextConfig);
