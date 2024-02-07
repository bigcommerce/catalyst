import { Message } from '@bigcommerce/components/Message';

import { getFeaturedProducts } from '~/client/queries/get-featured-products';
import { ProductCard } from '~/components/product-card';
import { SearchForm } from '~/components/search-form';

const FeaturedProducts = async () => {
  const featuredProducts = await getFeaturedProducts({ imageHeight: 500, imageWidth: 500 });

  return (
    <section className="w-full">
      <h3 className="mb-10 text-center text-h3 sm:text-start">Featured Products</h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.entityId} product={product} />
        ))}
      </div>
    </section>
  );
};

export const Forbidden = () => {
  return (
    <main className="mx-auto mb-10 flex max-w-[835px] flex-col justify-center gap-10 px-6 sm:px-10 lg:px-0 2xl:px-0">
      <Message className="flex-col gap-8 px-0 py-16">
        <h2 className="text-h2">There was a problem!</h2>
        <p className="text-lg">It looks like the page you requested can't be accessed.</p>
      </Message>
      <SearchForm />
      <FeaturedProducts />
    </main>
  );
};
