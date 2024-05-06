import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { LocaleType } from '~/i18n';

import { Description } from './_components/description';
import { Details } from './_components/details';
import { Gallery } from './_components/gallery';
import { RelatedProducts } from './_components/related-products';
import { Reviews } from './_components/reviews';
import { Warranty } from './_components/warranty';
import { getProduct } from './page-data';

interface ProductPageProps {
  params: { slug: string; locale: LocaleType };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const productId = Number(params.slug);
  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({ entityId: productId, optionValueIds });

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function Product({ params, searchParams }: ProductPageProps) {
  const { locale } = params;

  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Product' });
  const messages = await getMessages({ locale });

  const productId = Number(params.slug);

  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({ entityId: productId, optionValueIds });

  if (!product) {
    return notFound();
  }

  const category = removeEdgesAndNodes(product.categories).at(0);

  return (
    <>
      {category && <Breadcrumbs category={category} />}

      <div className="mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
        <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
          <Gallery noImageText={t('noGalleryText')} product={product} />
          <Details product={product} />
          <div className="lg:col-span-2">
            <Description product={product} />
            <Warranty product={product} />
            <Suspense fallback={t('loading')}>
              <Reviews productId={product.entityId} />
            </Suspense>
          </div>
        </NextIntlClientProvider>
      </div>

      <Suspense fallback={t('loading')}>
        <RelatedProducts productId={product.entityId} />
      </Suspense>
    </>
  );
}

function getOptionValueIds({ searchParams }: { searchParams: ProductPageProps['searchParams'] }) {
  const { slug, ...options } = searchParams;

  return Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}

export const runtime = 'edge';
