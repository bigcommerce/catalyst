import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { getRelatedProducts } from '~/client/queries/get-related-products';
import { ProductCardCarousel } from '~/components/product-card-carousel';

export const RelatedProducts = async ({ productId }: { productId: number }) => {
  const t = await getTranslations('Product');
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  const relatedProducts = await getRelatedProducts({
    productId,
  });

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
