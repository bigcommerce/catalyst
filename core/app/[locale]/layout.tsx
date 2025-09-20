import { Analytics } from '@/analytics/react';
import { SpeedInsights } from '@/speed-insights/next';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { cache, PropsWithChildren } from 'react';

import '../../globals.css';

import { fonts } from '~/app/fonts';
import { CookieNotifications } from '~/app/notifications';
import { Providers } from '~/app/providers';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { WebAnalyticsFragment } from '~/components/analytics/fragment';
import { AnalyticsProvider } from '~/components/analytics/provider';
import { ContainerQueryPolyfill } from '~/components/polyfills/container-query';
import { ScriptManagerScripts, ScriptsFragment } from '~/components/scripts';
import { routing } from '~/i18n/routing';
import { getToastNotification } from '~/lib/server-toast';
import { getSiteVersion } from "@makeswift/runtime/next/server";
import { MakeswiftProvider } from "~/makeswift/provider";
import "~/makeswift/components";

import GA4 from '~/components/analytics/GA4';
import CookieGate from '~/components/consent/CookieGate';


const RootLayoutMetadataQuery = graphql(
  `
    query RootLayoutMetadataQuery {
      site {
        settings {
          storeName
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
          ...WebAnalyticsFragment
        }
        content {
          ...ScriptsFragment
        }
      }
      channel {
        entityId
      }
    }
  `,
);

const fetchRootLayoutMetadata = cache(async () => {
  return await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await fetchRootLayoutMetadata();

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
      build_sha: process.env.NEXT_PUBLIC__GIT_COMMIT_SHA ?? '',
      store_hash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
    },
  };
}

const Components = () => {
  if (process.env. !== '1') {
    return null;
  }

  return (
    <>
      import { Analytics } from '@vercel/analytics/react';
      import { SpeedInsights } from '@vercel/speed-insights/next';
    </>
  );
};

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ params, children }: Props) {
  const { locale } = await params;

  const { data } = await fetchRootLayoutMetadata();
  const toastNotificationCookieData = await getToastNotification();

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs..app/docs/getting-started/app-router#add-setRequestLocale-to-all-layouts-and-pages
  setRequestLocale(locale);

  return (
    <html className={clsx(fonts.map((f) => f.variable))} lang={locale}>
      <head>
        <ScriptManagerScripts
          scripts={data.site.content.headerScripts}
          strategy="afterInteractive"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <GA4 />
<CookieGate />
<MakeswiftProvider siteVersion={await getSiteVersion()}>
  {children}
</MakeswiftProvider
          <NextIntlClientProvider>
          <NuqsAdapter>
            <AnalyticsProvider channelId={data.channel.entityId} settings={data.site.settings}>
              <Providers>
                {toastNotificationCookieData && (
                  <CookieNotifications {...toastNotificationCookieData} />
                )}
                {children}
              </Providers>
            </AnalyticsProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
        <Components />
        <ContainerQueryPolyfill />
        <ScriptManagerScripts scripts={data.site.content.footerScripts} strategy="lazyOnload" />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const fetchCache = 'default-cache';
