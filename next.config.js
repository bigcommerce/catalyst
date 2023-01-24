const isDevelopment = process.env.NODE_ENV !== 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    runtime: isDevelopment ? undefined : 'experimental-edge',
    fetchCache: true,
  },
  images: {
    loaderFile: isDevelopment ? undefined : './src/bigcommerceImageLoader.js',
    domains: ['cdn11.bigcommerce.com'],
  },
};

module.exports = nextConfig;
