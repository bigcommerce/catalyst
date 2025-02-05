import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { Cart } from '~/components/header/cart';
//import { LocaleType } from '~/i18n/routing';
import SalesBuddyPage from './sales-buddy/page';

import { cookies, headers } from 'next/headers';
import { ReferrerId } from '~/belami/components/referrer-id';

const flagSalesBuddy = Number(process.env.SALES_BUDDY_FLAG);

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

const BAD_UA_KEYWORDS = ["bot", "agent", "crawl", "spider", "slurp", "rpt-httpclient", "msnptc", "ktxn", "netcraft", "postman", "curl", "python", "go-http-client", "java", "okhttp", "node-fetch", "axios", "http-client", "httpurlconnection", "okhttp", "vercel", "iframely", "alittle", "scrapy", "dummy", "censys", "researchscan"];

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

  return (
    <>
      {(
        !BAD_UA_KEYWORDS.some(keyword => ua?.toLowerCase().includes(keyword)) && 
        !process.env.LOCAL_IPS?.includes(ip) && 
        !process.env.NO_REFERRER_IPS?.includes(ip) && 
        !isMakeSwift
      )
        ? <ReferrerId sid={Number(process.env.SITE_CONFIG_ID ?? 0)} referrerId={referrerIdCookie?.value || null} ip={ip} ua={ua} referrer={referrer} />
        : null
      }
      <Suspense fallback={<HeaderSkeleton />}>
        <Header cart={<Cart />} />
      </Suspense>
      <main className="main-slider mt-[2em] md:mt-0">
        {children}
      </main>
      <Suspense>
        <Footer />
        <SalesBuddyPage />
      </Suspense>
    </>
  );
}
