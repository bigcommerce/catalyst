import client from '~/client';
import { Hero } from '~/components/Hero';
import { ProductCardCarousel } from '~/components/ProductCardCarousel';

export default async function Home() {
  const [bestSellingProducts, featuredProducts] = await Promise.all([
    client.getBestSellingProducts({ imageWidth: 500, imageHeight: 500 }),
    client.getFeaturedProducts({ imageWidth: 500, imageHeight: 500 }),
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
