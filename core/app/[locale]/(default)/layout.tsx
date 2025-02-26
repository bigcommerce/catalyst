import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { Cart } from '~/components/header/cart';
//import { LocaleType } from '~/i18n/routing';
import SalesBuddyPage from './sales-buddy/page';

import { cookies, headers } from 'next/headers';
import { ReferrerId } from '~/belami/components/referrer-id';
import { isBadUserAgent } from '~/belami/lib/bot-detection';

import { MakeswiftComponent } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { client as makeswiftClient } from '~/lib/makeswift/client';

import { MegaBannerContextProvider } from '~/belami/components/mega-banner';

const flagSalesBuddy = Number(process.env.SALES_BUDDY_FLAG);

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {

  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const referrerIdCookie = cookieStore.get('referrerId');
  const headersList = await headers();
  const referrer = headersList.get('referer') || '';
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headersList.get('user-agent') || '';
  const isMakeSwift = !!headersList.get('x-makeswift-draft-mode');

  const megaBannerSnapshot = await makeswiftClient.getComponentSnapshot('belami-mega-banner', {
    siteVersion: await getSiteVersion()
  });

  return (
    <>
      {(
        await isBadUserAgent(ua) === false && 
        !process.env.LOCAL_IPS?.includes(ip) && 
        !process.env.NO_REFERRER_IPS?.includes(ip) && 
        !isMakeSwift
      )
        ? <ReferrerId sid={Number(process.env.SITE_CONFIG_ID ?? 0)} referrerId={referrerIdCookie?.value || null} ip={ip} ua={ua} referrer={referrer} />
        : null
      }

      <Suspense fallback={<></>}>
        <MegaBannerContextProvider value={{ location: 'top' }}>
          <MakeswiftComponent snapshot={megaBannerSnapshot} label={`Mega Banner`} type='belami-mega-banner' />
        </MegaBannerContextProvider>
      </Suspense>

      <Suspense fallback={<HeaderSkeleton />}>
        <Header cart={<Cart />} />
      </Suspense>

      <Suspense fallback={<></>}>
        <MegaBannerContextProvider value={{ location: 'under-header' }}>
          <MakeswiftComponent snapshot={megaBannerSnapshot} label={`Mega Banner`} type='belami-mega-banner' />
        </MegaBannerContextProvider>
      </Suspense>

      <main className="main-slider">
        {children}
      </main>

      <Suspense fallback={<></>}>
        <MegaBannerContextProvider value={{ location: 'before-footer' }}>
          <MakeswiftComponent snapshot={megaBannerSnapshot} label={`Mega Banner`} type='belami-mega-banner' />
        </MegaBannerContextProvider>
      </Suspense>

      <Suspense>
        <Footer />
        <SalesBuddyPage />
      </Suspense>
    </>
  );
}
