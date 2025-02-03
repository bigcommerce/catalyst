import { DraftModeScript } from '@makeswift/runtime/next/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import { PropsWithChildren, Suspense } from 'react';

import '../globals.css';
import 'instantsearch.css/themes/satellite-min.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
//import { MakeswiftProvider } from '~/lib/makeswift/provider';

import { Notifications } from '../notifications';
import { Providers } from '../providers';

import '~/lib/makeswift/components';

import { cn } from '~/lib/utils';

import { Open_Sans, Roboto_Mono } from 'next/font/google';

import Script from 'next/script';
import { SiteVibesIntegration } from "~/belami/components/sitevibes";
import { DatadogInit } from "~/belami/components/datadog";
import '~/lib/makeswift/components';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

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
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
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

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html className={cn(openSans.variable, robotoMono.variable, 'font-sans')} lang={locale}>
      <head>
        <DraftModeScript />
      </head>
      <body className="flex h-screen min-w-[375px] flex-col">
        <DatadogInit />
        <Script
          id="sv-pixel-script"
          src="https://app.sitevibes.com/js/pixel.js?key=e0feae51-26fd-453a-8e67-f9a1a74c8d69"
          strategy="afterInteractive"
        />
        <Suspense>
          <SiteVibesIntegration />
        </Suspense>
        <Notifications />
        <MakeswiftProvider previewMode={(await draftMode()).isEnabled}>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>{children}</Providers>
        </NextIntlClientProvider>
        </MakeswiftProvider>
        <VercelComponents />
      </body>
    </html>
  );
}

export const fetchCache = 'default-cache';
