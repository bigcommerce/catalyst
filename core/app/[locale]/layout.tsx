import { getSiteVersion } from '@makeswift/runtime/next/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PropsWithChildren } from 'react';

import '../globals.css';

import { fonts } from '~/app/fonts';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { routing } from '~/i18n/routing';
import { SiteTheme } from '~/lib/makeswift/components/site-theme';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

import { B2BProvider } from '~/components/b2b/provider';
import { B2BCartProvider } from '~/components/b2b/cart-context';
import { B2BCartDrawer } from '~/components/b2b/cart-drawer';
import { getUser } from '~/lib/user';

import { getToastNotification } from '../../lib/server-toast';
import { CookieNotifications } from '../notifications';
import { Providers } from '../providers';

import '~/lib/makeswift/components';

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

  const defaultTitle =
    pageTitle && pageTitle.length >= 10 && pageTitle.length <= 60
      ? pageTitle
      : `${storeName} - Quality Products & Service`;
  const defaultDescription =
    metaDescription && metaDescription.length <= 160
      ? metaDescription
      : `${storeName} offers a curated selection of quality products and outstanding service. Discover our range today!`;

  return {
    title: {
      template: `%s - ${storeName}`,
      default: defaultTitle,
    },
    description: defaultDescription,
    icons: {
      icon: '/favicon.ico',
    },
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gitool.com',
      siteName: storeName,
      images: [
        {
          url: process.env.NEXT_PUBLIC_OG_IMAGE || '/favicon.ico',
          alt: `${storeName} Logo`,
        },
      ],
    },
    other: {
      platform: 'bigcommerce.catalyst',
      build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
      store_hash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
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
  const toastNotificationCookieData = await getToastNotification();

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // SEO values for Schema.org injection
  const { data } = await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });
  const storeName = data.site.settings?.storeName ?? '';
  const metaDescription = data.site.settings?.seo?.metaDescription;
  const defaultDescription =
    metaDescription && metaDescription.length <= 160
      ? metaDescription
      : `${storeName} offers a curated selection of quality products and outstanding service. Discover our range today!`;

  // need to call this method everywhere where static rendering is enabled
  setRequestLocale(locale);

  const [messages] = await Promise.all([getMessages(), getUser()]);

  return (
    <MakeswiftProvider siteVersion={await getSiteVersion()}>
      <html className={clsx(fonts.map((f) => f.variable))} lang={locale}>
        <head>
          <SiteTheme />
          {/* Schema.org Organization structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: storeName,
                url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
                logo: process.env.NEXT_PUBLIC_OG_IMAGE || '/favicon.ico',
                description: defaultDescription,
              }),
            }}
          />
          {/* Lucky Orange tracking */}
          <script async defer src="https://tools.luckyorange.com/core/lo.js?site-id=a83f895c" />
        </head>
        <body>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <Providers>
                {toastNotificationCookieData && (
                  <CookieNotifications {...toastNotificationCookieData} />
                )}
                <B2BCartProvider>
                  <B2BProvider>{children}</B2BProvider>
                  <B2BCartDrawer />
                </B2BCartProvider>
              </Providers>
            </NuqsAdapter>
          </NextIntlClientProvider>
          <VercelComponents />
        </body>
      </html>
    </MakeswiftProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const fetchCache = 'default-cache';
