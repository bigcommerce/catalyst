import { DraftModeScript } from '@makeswift/runtime/next/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import { DM_Serif_Text, Inter, Roboto_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PropsWithChildren } from 'react';
import { draftMode } from 'next/headers';

import '../globals.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { Notifications } from '../notifications';
import { Providers } from '../providers';

import '~/lib/makeswift/components';
import { CssTheme } from '~/lib/makeswift/components/css-theme';
import { colors } from '~/lib/makeswift/components/css-theme/theme';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

export const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-inter',
});

export const dm_serif_text = DM_Serif_Text({
  display: 'swap',
  subsets: ['latin'],
  weight: '400',
  variable: '--font-family-dm-serif-text',
});

export const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-roboto-mono',
});

const RootLayoutMetadataQuery = graphql(`
  query RootLayoutMetadataQuery {
    site {
      settings {
        storeName
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  const { data } = await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });

  const storeName = data.site.settings?.storeName ?? '';

  const { pageTitle, metaDescription, metaKeywords } = data.site.settings?.seo || {};

  return {
    title: {
      template: `%s - ${storeName}`,
      default: pageTitle || storeName,
    },
    icons: {
      icon: '/favicon.ico', // app/favicon.ico/route.ts
    },
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    other: {
      platform: 'bigcommerce.catalyst',
      build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
    },
  };
}

const VercelComponents = () => {
  if (process.env.VERCEL !== '1') {
    return null;
  }

  return (
    <>
      {process.env.DISABLE_VERCEL_ANALYTICS !== 'true' && <Analytics />}
      {process.env.DISABLE_VERCEL_SPEED_INSIGHTS !== 'true' && <SpeedInsights />}
    </>
  );
};

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ params, children }: Props) {
  const { locale } = await params;

  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-setRequestLocale-to-all-layouts-and-pages
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <MakeswiftProvider previewMode={(await draftMode()).isEnabled}>
      <html
        className={clsx(inter.variable, dm_serif_text.variable, roboto_mono.variable)}
        lang={locale}
      >
        <head>
          <CssTheme colors={colors} />
          <DraftModeScript appOrigin={process.env.MAKESWIFT_APP_ORIGIN} />
        </head>
        <body>
          <Notifications />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <Providers>{children}</Providers>
            </NuqsAdapter>
          </NextIntlClientProvider>
          <VercelComponents />
        </body>
      </html>
    </MakeswiftProvider>
  );
}

export const fetchCache = 'default-cache';
