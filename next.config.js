const isProduction = process.env.NODE_ENV !== 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loaderFile: isProduction ? './src/bigcommerceImageLoader.ts' : undefined,
    domains: ['cdn11.bigcommerce.com'],
  },
};

module.exports = nextConfig;
