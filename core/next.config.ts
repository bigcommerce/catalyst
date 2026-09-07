import createWithMakeswift from '@makeswift/runtime/next/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader } from './lib/content-security-policy';

const withMakeswift = createWithMakeswift({ appOrigin: process.env.MAKESWIFT_APP_ORIGIN });
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
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    // default URL generation in BigCommerce uses trailing slash
    trailingSlash: process.env.TRAILING_SLASH !== 'false',
    async rewrites() {
      return [
        {
          source: '/login.php',
          destination: '/login',
        },
      ];
    },
    async redirects() {
      return [
        {
          source: '/shop',
          destination: '/categories',
          permanent: true,
        },
        {
          // Redirect es-MX URLs to English equivalents — BigCommerce sitemap
          // generates these URLs but the catalog has no Spanish translations,
          // causing 404s for users clicking through from Google. Permanent
          // (308) so GSC actually consolidates/clears these URLs from the
          // index instead of continuing to treat the redirect as reversible.
          source: '/es-MX/:path*',
          destination: '/:path*',
          permanent: true,
        },
      ];
    },
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
              value: `<https://${process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME ?? 'cdn11.bigcommerce.com'}>; rel=preconnect`,
            },
          ],
        },
      ];
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
