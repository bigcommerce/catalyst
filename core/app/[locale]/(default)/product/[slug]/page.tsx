import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { IconBlock } from '@/vibes/soul/sections/icon-block';
import { AccordionItem, ProductDescription } from '@/vibes/soul/sections/product-description';
import { ProductDetail } from '@/vibes/soul/sections/product-detail';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { LocaleType } from '~/i18n/routing';

import { ProductViewed } from './_components/product-viewed';
import { RelatedProducts } from './_components/related-products';
import { Reviews } from './_components/reviews';
import { getProduct } from './page-data';

interface Props {
  params: { slug: string; locale: LocaleType };
  searchParams: Record<string, string | string[] | undefined>;
}

function getOptionValueIds({ searchParams }: { searchParams: Props['searchParams'] }) {
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const productId = Number(params.slug);
  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: true,
  });

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

export default async function Product({ params: { locale, slug }, searchParams }: Props) {
  setRequestLocale(locale);

  const t = await getTranslations('Product');

  const format = await getFormatter();

  const productId = Number(slug);

  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: true,
  });

  if (!product) {
    return notFound();
  }

  // TODO: add breadcrumb
  // const category = removeEdgesAndNodes(product.categories).at(0);

  const accordions: AccordionItem[] = [
    // Description - only if not null/empty
    ...(product.description ? [{
      title: t('Description.heading'),
      content: <div className="prose" dangerouslySetInnerHTML={{ __html: product.description }} />
    }] : []),

    // Additional Details - only if there are custom fields
    ...(product.customFields.edges?.length ? [{
      title: t('Details.additionalDetails'),
      content: (
        <div className="prose">
          {product.customFields.edges.map((field, index) => (
            <div key={index}>
              <strong>{field.node.name}</strong> <br />
              {field.node.value}
              {index < product.customFields.edges.length - 1 && <br />}
            </div>
          ))}
        </div>
      )
    }] : []),

    // Warranty - only if not null/empty
    ...(product.warranty ? [{
      title: t('Warranty.heading'),
      content: <div className="prose" dangerouslySetInnerHTML={{ __html: product.warranty }} />
    }] : []),
  ];

  const formattedProduct = {
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: { src: product.defaultImage?.url ?? '', alt: product.defaultImage?.altText ?? '' },
    images: removeEdgesAndNodes(product.images).map((image) => ({
      src: image.url,
      alt: image.altText,
    })),
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name,
    description: product.description,
    rating: product.reviewSummary.averageRating,
  };

  return (
    <>
      <ProductDetail product={formattedProduct} />

      <ProductDescription
        accordions={accordions}
        image={{
          src: product.defaultImage?.url ?? '',
          alt: product.defaultImage?.altText ?? '',
        }}
      />

      {/* TODO: Temporary */}
      <IconBlock
        list={[
          {
            icon: 'Truck',
            title: 'Free Shipping',
            description: 'On orders over $250',
          },
          {
            icon: 'RotateCcw',
            title: 'Free Returns',
            description: 'On full priced items only',
          },
          {
            icon: 'Star',
            title: '2 Year Warranty',
            description: 'As standard',
          },
        ]}
      />

      <Suspense fallback={t('loading')}>
        <RelatedProducts productId={product.entityId} />
      </Suspense>

      <Suspense fallback={t('loading')}>
        <Reviews productId={product.entityId} />
      </Suspense>

      <ProductViewed product={product} />
    </>
  );
}

export const runtime = 'edge';
