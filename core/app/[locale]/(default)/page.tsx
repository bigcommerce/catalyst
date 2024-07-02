import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getPageData } from './page-data';
import { Hero } from '~/components/hero';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { LocaleType } from '~/i18n';

interface Props {
  params: {
    locale: LocaleType;
  };
}

export default async function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Home' });
  const messages = await getMessages({ locale });

  const pageData = await getPageData();
  const featuredProducts = pageData.featuredProducts;
  const newestProducts = pageData.newestProducts;

  console.log(pageData, ' is page data');

  return (
    <>
      <Hero />

      <div className="my-10">
        <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
          <ProductCardCarousel
            products={featuredProducts}
            showCart={false}
            showCompare={false}
            showReviews={false}
            title={t('Carousel.featuredProducts')}
          />
          <ProductCardCarousel
            products={newestProducts}
            showCart={false}
            showCompare={false}
            showReviews={false}
            title={t('Carousel.newestProducts')}
          />
        </NextIntlClientProvider>
      </div>
    </>
  );
}

export const runtime = 'edge';
