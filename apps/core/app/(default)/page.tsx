import { getBestSellingProducts } from '~/client/queries/getBestSellingProducts';
import { getFeaturedProducts } from '~/client/queries/getFeaturedProducts';
import { Hero } from '~/components/Hero';
import { ProductCardCarousel } from '~/components/ProductCardCarousel';

export default async function Home() {
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
          title="Best Selling Products"
        />

        <ProductCardCarousel
          products={featuredProducts}
          showCart={false}
          showCompare={false}
          title="Featured Products"
        />
      </div>
    </>
  );
}

export const runtime = 'edge';
export const fetchCache = 'force-cache';
