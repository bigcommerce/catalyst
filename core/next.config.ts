import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader } from './lib/content-security-policy';

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
      ppr: 'incremental',
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
            // These headers help BigCommerce support identify your storefront; you may delete them if you wish,
            // but doing so will make it harder for BigCommerce support to help you efficiently.
            {
              key: 'X-Bc-Store-Hash',
              value: process.env.BIGCOMMERCE_STORE_HASH,
            },
            {
              key: 'X-Bc-Primary-Channel-Id',
              value: process.env.BIGCOMMERCE_CHANNEL_ID,
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

  await writeLocaleToBuildConfig();

  return nextConfig;
};

async function writeLocaleToBuildConfig() {
  const { data } = await client.fetch({ document: LocaleQuery });

  await writeBuildConfig({ locales: data.site.settings?.locales });
}
