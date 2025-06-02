import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import * as z from 'zod';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CompareSection } from '@/vibes/soul/sections/compare-section';
import { getSessionCustomerAccessToken } from '~/auth';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { addToCart } from './_actions/add-to-cart';
import { CompareAnalyticsProvider } from './_components/compare-analytics-provider';
import { getComparedProducts } from './page-data';

const CompareParamsSchema = z.object({
  ids: z
    .union([z.string(), z.array(z.string()), z.undefined()])
    .transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'string') {
        return [...value.split(',')];
      }

      return undefined;
    })
    .transform((value) => value?.map((id) => parseInt(id, 10))),
});

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    ids?: string | string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Compare' });

  return {
    title: t('title'),
  };
}

export default async function Compare(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Compare');

  const streamableProducts = Streamable.from(async () => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const searchParams = await props.searchParams;
    const parsed = CompareParamsSchema.parse(searchParams);
    const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

    const products = await getComparedProducts(productIds, currencyCode, customerAccessToken);
    const format = await getFormatter();

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(product.prices, format),
      subtitle: product.brand?.name ?? undefined,
      rating: product.reviewSummary.averageRating,
      description: <div dangerouslySetInnerHTML={{ __html: product.description }} />,
      customFields: [
        { name: t('sku'), value: product.sku },
        { name: t('weight'), value: `${product.weight?.value} ${product.weight?.unit}` },
        ...removeEdgesAndNodes(product.customFields).map(({ name, value }) => ({ name, value })),
      ],
      hasVariants: removeEdgesAndNodes(product.productOptions).length > 0,
      isPreorder: product.availabilityV2.status === 'Preorder',
      disabled: product.availabilityV2.status === 'Unavailable' || !product.inventory.isInStock,
    }));
  });

  const streamableAnalyticsData = Streamable.from(async () => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();

    const searchParams = await props.searchParams;
    const parsed = CompareParamsSchema.parse(searchParams);
    const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

    const products = await getComparedProducts(productIds, currencyCode, customerAccessToken);

    return products.map((product) => {
      return {
        id: product.entityId,
        name: product.name,
        sku: product.sku,
        brand: product.brand?.name ?? '',
        price: product.prices?.price.value ?? 0,
        currency: product.prices?.price.currencyCode ?? '',
      };
    });
  });

  return (
    <CompareAnalyticsProvider data={streamableAnalyticsData}>
      <CompareSection
        addToCartAction={addToCart}
        addToCartLabel={t('addToCart')}
        descriptionLabel={t('description')}
        emptyStateTitle={t('noProductsToCompare')}
        nextLabel={t('next')}
        noDescriptionLabel={t('noDescription')}
        noOtherDetailsLabel={t('noOtherDetails')}
        noRatingsLabel={t('noRatings')}
        otherDetailsLabel={t('otherDetails')}
        previousLabel={t('previous')}
        products={streamableProducts}
        ratingLabel={t('rating')}
        title={t('title')}
        viewOptionsLabel={t('viewOptions')}
      />
    </CompareAnalyticsProvider>
  );
}

// Disabled to circumvent a bug in Next.js and PPR
// More info: https://github.com/vercel/next.js/issues/59407
export const experimental_ppr = false;
