import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader } from './lib/content-security-policy';
import { generateBloomFilterJSON } from './scripts/generate-bloom-filter';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json',
  },
});

const SettingsQuery = graphql(`
  query SettingsQuery {
    site {
      settings {
        url {
          vanityUrl
          cdnUrl
          checkoutUrl
        }
        locales {
          code
          isDefault
        }
      }
    }
  }
`);

async function writeSettingsToBuildConfig(trailingSlash: boolean) {
  const { data } = await client.fetch({ document: SettingsQuery });

  const bloomFilterJSON = await generateBloomFilterJSON(trailingSlash);

  return await writeBuildConfig({
    locales: data.site.settings?.locales,
    urls: {
      ...data.site.settings?.url,
      cdnUrl: process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME ?? data.site.settings?.url.cdnUrl,
    },
    bloomFilterJSON,
    trailingSlash,
  });
}

export default async (): Promise<NextConfig> => {
  const trailingSlash = process.env.TRAILING_SLASH !== 'false';

  const settings = await writeSettingsToBuildConfig(trailingSlash);

  let nextConfig: NextConfig = {
    reactStrictMode: true,
    experimental: {
      optimizePackageImports: ['@icons-pack/react-simple-icons'],
      ppr: 'incremental',
      nodeMiddleware: true,
    },
    typescript: {
      ignoreBuildErrors: !!process.env.CI,
    },
    eslint: {
      ignoreDuringBuilds: !!process.env.CI,
      dirs: [
        'app',
        'auth',
        'build-config',
        'client',
        'components',
        'data-transformers',
        'i18n',
        'lib',
        'middlewares',
        'scripts',
        'tests',
        'vibes',
      ],
    },
    trailingSlash: trailingSlash,
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
              value: settings.urls.cdnUrl ? `<https://${settings.urls.cdnUrl}>; rel=preconnect` : '',
            },
          ],
        },
      ];
    },
  };

  nextConfig = withNextIntl(nextConfig);

  if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = bundleAnalyzer();

    nextConfig = withBundleAnalyzer(nextConfig);
  }

  return nextConfig;
};
