const isProduction = process.env.NODE_ENV !== 'development';
const isDevelopment = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loaderFile: isProduction ? './src/bigcommerceImageLoader.ts' : undefined,
    domains: ['cdn11.bigcommerce.com'],
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
