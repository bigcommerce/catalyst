const isDevelopment = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    runtime: 'experimental-edge',
  },
  images: {
    remotePatterns: [
      {
        hostname: process.env.BIGCOMMERCE_CDN_HOSTNAME ?? '*.bigcommerce.com',
      },
    ],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  exportPathMap: (defaultPathMap) => {
    if (isDevelopment) {
      return defaultPathMap;
    }

    // Ensures the reactant playground page doesn't get built to production
    const { '/_reactant': reactant, ...rest } = defaultPathMap;

    return rest;
  },
};

module.exports = nextConfig;
