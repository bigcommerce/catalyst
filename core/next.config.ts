/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { optimize } from 'webpack';

import { cspHeader } from './lib/content-security-policy';

const withNextIntl = createNextIntlPlugin();

let nextConfig: NextConfig = {
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
  webpack: (config, { isServer }) => {
    if (process.env.NODE_V8_COVERAGE) {
      Object.defineProperty(config, 'devtool', {
        get() {
          return 'source-map';
        },
        set() {
          // No empty
        },
      });
    }

    // Limit the number of chunks to reduce CDN requests, which contribute to Edge Request costs
    // Making this number higher may improve performance, but making it lower will reduce total requests and costs
    // Simply set the WEBPACK_MAX_CHUNKS environment variable to the desired number of chunks
    if (!isServer) {
      config.plugins.push(
        new optimize.LimitChunkCountPlugin({
          maxChunks: process.env.WEBPACK_MAX_CHUNKS
            ? parseInt(process.env.WEBPACK_MAX_CHUNKS, 10)
            : 50,
        }),
      );
    }

    return config;
  },
  // default URL generation in BigCommerce uses trailing slash
  trailingSlash: process.env.TRAILING_SLASH !== 'false',

  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'Link',
            value: `<https://${process.env.BIGCOMMERCE_CDN_HOSTNAME ?? 'cdn11.bigcommerce.com'}>; rel=preconnect`,
          },
        ],
      },
    ];
  },
};

// Apply withNextIntl to the config
nextConfig = withNextIntl(nextConfig);

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = bundleAnalyzer();

  nextConfig = withBundleAnalyzer(nextConfig);
}

export default () => nextConfig;
