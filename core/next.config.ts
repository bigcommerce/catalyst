import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createWithMakeswift from '@makeswift/runtime/next/plugin';
import createNextIntlPlugin from 'next-intl/plugin';
import { optimize } from 'webpack';

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader } from './lib/content-security-policy';

const withMakeswift = createWithMakeswift({ previewMode: false });
const withNextIntl = createNextIntlPlugin();

const LocaleQuery = graphql(`
  query LocaleQuery {
    site {
      settings {
        locales {
          code
          isDefault
        }
      }
    }
  }
`);

export default async (): Promise<NextConfig> => {
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
      // Limit the number of chunks to reduce CDN requests, which contribute to Edge Request costs
      // Making this number higher may improve performance, but making it lower will reduce total requests and costs
      // Simply set the WEBPACK_MAX_CHUNKS environment variable to the desired number of chunks
      if (!isServer) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        config.plugins.push(
          new optimize.LimitChunkCountPlugin({
            maxChunks: process.env.WEBPACK_MAX_CHUNKS
              ? parseInt(process.env.WEBPACK_MAX_CHUNKS, 10)
              : 50,
          }),
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    async rewrites() {
      return [
        {
          source: '/checkout/',
          destination: `https://${process.env.BIGCOMMERCE_CHECKOUT_URL ?? 'belami-e-commerce-sandbox-1.mybigcommerce.com'}/checkout`,
        },
      ]
    },
  };

  // Apply withNextIntl to the config
  nextConfig = withNextIntl(nextConfig);

  // Apply withMakeswift to the config
  nextConfig = withMakeswift(nextConfig);

  if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = bundleAnalyzer();

    nextConfig = withBundleAnalyzer(nextConfig);
  }

  await writeLocaleToBuildConfig();

  return nextConfig;
};

async function writeLocaleToBuildConfig() {
  const { data } = await client.fetch({ document: LocaleQuery });

  await writeBuildConfig({ locales: data.site.settings?.locales });
}
