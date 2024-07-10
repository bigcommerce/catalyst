// @ts-check
const createWithMakeswift = require('@makeswift/runtime/next/plugin');
const createNextIntlPlugin = require('next-intl/plugin');

const withMakeswift = createWithMakeswift({ previewMode: false });
const withNextIntl = createNextIntlPlugin();

// @todo relax csp for makeswift embedding
// const cspHeader = `
//   base-uri 'self';
//   form-action 'self';
//   frame-ancestors 'none';
// `;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@icons-pack/react-simple-icons'],
  },
  typescript: {
    ignoreBuildErrors: !!process.env.CI,
  },
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
    dirs: ['app', 'client', 'components', 'lib', 'middlewares'],
  },
  // default URL generation in BigCommerce uses trailing slash
  trailingSlash: process.env.TRAILING_SLASH !== 'false',
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: cspHeader.replace(/\n/g, ''),
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = withMakeswift(withNextIntl(nextConfig));
