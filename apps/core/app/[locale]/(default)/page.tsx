import { getTranslations } from 'next-intl/server';

import { getBestSellingProducts } from '~/client/queries/getBestSellingProducts';
import { getFeaturedProducts } from '~/client/queries/getFeaturedProducts';
import { Hero } from '~/components/Hero';
import { ProductCardCarousel } from '~/components/ProductCardCarousel';

export default async function Home() {
  const t = await getTranslations('Home');
  const [bestSellingProducts, featuredProducts] = await Promise.all([
    getBestSellingProducts({ imageWidth: 500, imageHeight: 500 }),
    getFeaturedProducts({ imageWidth: 500, imageHeight: 500 }),
  ]);

  return (
    <>
      <Hero />

      <div className="my-10">
        <ProductCardCarousel
          products={bestSellingProducts}
          showCart={false}
          showCompare={false}
          title={t('Carousel.bestSellingProducts')}
        />

        <ProductCardCarousel
          products={featuredProducts}
          showCart={false}
          showCompare={false}
          title={t('Carousel.featuredProducts')}
        />
      </div>
    </>
  );
}

export const runtime = 'edge';
