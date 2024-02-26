import { getFeaturedProducts } from '~/client/queries/get-featured-products';
import { getNewestProducts } from '~/client/queries/get-newest-products';
import { Hero } from '~/components/hero';
import { ProductCardCarousel } from '~/components/product-card-carousel';

export default async function Home() {
  const [newestProducts, featuredProducts] = await Promise.all([
    getNewestProducts({ imageWidth: 500, imageHeight: 500 }),
    getFeaturedProducts({ imageWidth: 500, imageHeight: 500 }),
  ]);

  return (
    <>
      <Hero />

      <div className="my-10">
        <ProductCardCarousel
          products={featuredProducts}
          showCart={false}
          showCompare={false}
          showReviews={false}
          title="Featured products"
        />
        <ProductCardCarousel
          products={newestProducts}
          showCart={false}
          showCompare={false}
          showReviews={false}
          title="Newest products"
        />
      </div>
    </>
  );
}

export const runtime = 'edge';
