import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Breadcrumbs } from '~/components/breadcrumbs';

import { getSessionCustomerAccessToken } from '~/auth';

import { getCategoryPageData } from './page-data';

import { getActivePromotions } from '~/belami/lib/fetch-promotions';
import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';
import { isBadUserAgent } from '~/belami/lib/bot-detection';

import { Category } from './category';

import { cookies, headers } from 'next/headers';

import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { defaultLocale } from '~/i18n/routing';

import { Suspense } from 'react';
import { MakeswiftComponent } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { client as makeswiftClient } from '~/lib/makeswift/client';

import { MegaBannerContextProvider } from '~/belami/components/mega-banner';

//import '~/lib/makeswift/components';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryId = Number(slug);

  const data = await getCategoryPageData({
    categoryId,
  });

  const category = data.category;

  if (!category) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const cookieStore = await cookies();
  const priceMaxCookie = cookieStore.get('pmx');
  const priceMaxTriggers = priceMaxCookie?.value
    ? JSON.parse(atob(priceMaxCookie?.value))
    : undefined;

  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country');
  const region = headersList.get('x-vercel-ip-country-region');
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headersList.get('user-agent') || '';

  const isBot = await isBadUserAgent(ua);
  const isCaliforniaIp = country === 'US' && region === 'CA';

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const { locale, slug } = params;

  setRequestLocale(locale);

  const t = await getTranslations('Category');

  const categoryId = Number(slug);

  const { category, categoryTree } = await getCategoryPageData({ categoryId });

  if (!category) {
    return notFound();
  }

  const snapshot = await makeswiftClient.getPageSnapshot(category.path, {
    siteVersion: await getSiteVersion(),
    locale: locale === defaultLocale ? undefined : locale,
  });

  const megaBannerSnapshot = await makeswiftClient.getComponentSnapshot('belami-mega-banner', {
    siteVersion: await getSiteVersion()
  });

  const promotions = await getActivePromotions(true);
  const priceMaxRules =
    priceMaxTriggers && Object.values(priceMaxTriggers).length > 0
      ? await getPriceMaxRules(priceMaxTriggers)
      : null;

  return (
    <div className="group px-4 py-4 xl:px-12">
      <Breadcrumbs category={category} />
      <div className="mb-0 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-2xl lg:mb-0">{category.name}</h1>
      </div>

      {!!snapshot && <MakeswiftPage snapshot={snapshot} />}

      <Suspense fallback={<></>}>
        <MegaBannerContextProvider value={{ location: 'above-products', categoryId: categoryId }}>
          <MakeswiftComponent snapshot={megaBannerSnapshot} label={`Mega Banner`} type='belami-mega-banner' />
        </MegaBannerContextProvider>
      </Suspense>

      <Category
        category={category}
        promotions={promotions}
        useDefaultPrices={useDefaultPrices}
        priceMaxRules={priceMaxRules}
        userContext={{
          isBot: isBot,
          isCaliforniaIp: isCaliforniaIp,
          ip: ip,
          ua: ua,
          isGuest: !customerAccessToken
        }}
      />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
