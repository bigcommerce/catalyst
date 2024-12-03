import { DraftModeScript } from '@makeswift/runtime/next/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PropsWithChildren } from 'react';

import '../globals.css';
import 'instantsearch.css/themes/satellite-min.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { Notifications } from '../notifications';
import { Providers } from '../providers';

import { cn } from '~/lib/utils';

import { Open_Sans, Roboto_Mono } from 'next/font/google';

import Script from 'next/script';

import '~/lib/makeswift/components';

const dm_serif_text = localFont({
  src: [
    {
      path: '../../public/fonts/DMSerifText-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-family-heading',
});

const inter = localFont({
  src: '../../public/fonts/Inter-Variable.woff2',
  variable: '--font-family-body',
});

const roboto_mono = localFont({
  src: '../../public/fonts/RobotoMono-Variable.woff2',
  variable: '--font-family-mono',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-opensans',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

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
  params: { locale: string };
}

export default async function RootLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html className={cn(openSans.variable, robotoMono.variable, 'font-sans')} lang={locale}>
      <head>
        <DraftModeScript />
        <Script
          id="sv-pixel-script"
          src="https://app.sitevibes.com/js/pixel.js?key=e0feae51-26fd-453a-8e67-f9a1a74c8d69"
          async
        />
      </head>
      <body className="flex h-screen min-w-[375px] flex-col">
        <Notifications />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NuqsAdapter>
            <Providers>{children}</Providers>
          </NuqsAdapter>
        </NextIntlClientProvider>
        <VercelComponents />
      </body>
    </html>
  );
}

export const fetchCache = 'default-cache';
