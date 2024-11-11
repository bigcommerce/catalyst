import { DraftModeScript } from '@makeswift/runtime/next/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { draftMode } from 'next/headers';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PropsWithChildren } from 'react';

import '../globals.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { MakeswiftProvider } from '~/lib/makeswift/provider';
import { CssTheme } from '~/makeswift/components/css-theme';

import { Notifications } from '../notifications';
import { Providers } from '../providers';
import { colors } from '../theme';

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

export async function generateMetadata(): Promise<Metadata> {
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

export default function RootLayout({ children, params: { locale } }: Props) {
  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-setRequestLocale-to-all-layouts-and-pages
  setRequestLocale(locale);

  const messages = useMessages();

  return (
    <html
      className={[inter.variable, dm_serif_text.variable, roboto_mono.variable].join(' ')}
      lang={locale}
    >
      <MakeswiftProvider previewMode={draftMode().isEnabled}>
        <head>
          <CssTheme colors={colors} />
          <DraftModeScript appOrigin={process.env.MAKESWIFT_APP_ORIGIN} />
        </head>
        <body className="flex h-screen min-w-[375px] flex-col font-body">
          <Notifications />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <Providers>{children}</Providers>
            </NuqsAdapter>
          </NextIntlClientProvider>
          <VercelComponents />
        </body>
      </MakeswiftProvider>
    </html>
  );
}

export const fetchCache = 'default-cache';
