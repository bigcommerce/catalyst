import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { graphql, ResultOf } from '~/client/graphql';
import {
  ProductCardCarousel,
  ProductCardCarouselFragment,
} from '~/components/product-card-carousel';

export const RelatedProductsFragment = graphql(
  `
    fragment RelatedProductsFragment on Product {
      relatedProducts(first: 12) {
        edges {
          node {
            ...ProductCardCarouselFragment
          }
        }
      }
    }
  `,
  [ProductCardCarouselFragment],
);

interface Props {
  data: ResultOf<typeof RelatedProductsFragment>;
}

export const RelatedProducts = async ({ data }: Props) => {
  const t = await getTranslations('Product');
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  const relatedProducts = removeEdgesAndNodes(data.relatedProducts);

  return (
    <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
      <ProductCardCarousel
        products={relatedProducts}
        showCart={false}
        showCompare={false}
        showReviews={false}
        title={t('carouselTitle')}
      />
    </NextIntlClientProvider>
  );
};
