// @ts-check
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

const cspHeader = `
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@icons-pack/react-simple-icons'],
    instrumentationHook: true,
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    /**
     * @fixme This is completely redundant. webpack should understand
     * export conditions and don't try to import "msw/browser" code
     * that's clearly marked as client-side only in the app.
     */
    if (isServer) {
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: 'msw/browser', alias: false });
      } else {
        config.resolve.alias['msw/browser'] = false;
      }
    } else {
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: 'msw/node', alias: false });
      } else {
        config.resolve.alias['msw/node'] = false;
      }
    }

    return config;
  },
};

module.exports = withNextIntl(nextConfig);
