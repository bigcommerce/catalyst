import path from 'path';
import createWithMakeswift from '@makeswift/runtime/next/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader } from './lib/content-security-policy';

const withMakeswift = createWithMakeswift();

if (process.env.NODE_ENV !== 'production') {
  const b2bApiHost = process.env.B2B_API_HOST;

  if (b2bApiHost?.endsWith('/')) {
    throw new Error('B2B_API_HOST should not end with a trailing slash. Please update your .env file.');
  }
}

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

async function writeSettingsToBuildConfig() {
  const { data } = await client.fetch({ document: SettingsQuery });

  const cdnEnvHostnames = process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME;

  const cdnUrls = (
    cdnEnvHostnames
      ? cdnEnvHostnames.split(',').map((s) => s.trim())
      : [data.site.settings?.url.cdnUrl]
  ).filter((url): url is string => !!url);

  if (!cdnUrls.length) {
    throw new Error(
      'No CDN URLs found. Please ensure that NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME is set correctly.',
    );
  }

  return await writeBuildConfig({
    locales: data.site.settings?.locales,
    urls: {
      ...data.site.settings?.url,
      cdnUrls,
    },
  });
}

export default async (): Promise<NextConfig> => {
  const settings = await writeSettingsToBuildConfig();

  let nextConfig: NextConfig = {
    reactStrictMode: true,
    outputFileTracingRoot: path.join(__dirname, '..'),
    experimental: {
      optimizePackageImports: ['@icons-pack/react-simple-icons'],
      ppr: 'incremental',
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
    // default URL generation in BigCommerce uses trailing slash
    trailingSlash: process.env.TRAILING_SLASH !== 'false',
    // eslint-disable-next-line @typescript-eslint/require-await
    async headers() {
      const cdnLinks = settings.urls.cdnUrls.map((url) => ({
        key: 'Link',
        value: `<https://${url}>; rel=preconnect`,
      }));

      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: cspHeader.replace(/\n/g, ''),
            },
            ...cdnLinks,
          ],
        },
      ];
    },
    rewrites: async () => [
      { source: '/', destination: '/en' },
    ],
    redirects: async () => {
      const destination =
        process.env.NODE_ENV === 'production'
          ? 'https://mxplantae.com/:path*'
          : 'http://localhost:3001/:path*';

      return [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'www.mxplantae.com' }],
          destination,
          permanent: true,
        },
      ];
    },
  };

  nextConfig = withNextIntl(nextConfig);
  nextConfig = withMakeswift(nextConfig);

  if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = bundleAnalyzer();

    nextConfig = withBundleAnalyzer(nextConfig);
  }

  return nextConfig;
};
