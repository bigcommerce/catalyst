import { Message } from '@bigcommerce/components/Message';
import { ShoppingCart } from 'lucide-react';

import { getFeaturedProducts } from '~/client/queries/get-featured-products';
import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';
import { CartLink } from '~/components/header/cart';
import { ProductCard } from '~/components/product-card';
import { SearchForm } from '~/components/search-form';

export const metadata = {
  title: 'Not Found',
};

export default async function NotFound() {
  const featuredProducts = await getFeaturedProducts({ imageHeight: 500, imageWidth: 500 });

  return (
    <>
      <Header
        cart={
          <CartLink>
            <ShoppingCart aria-label="cart" />
          </CartLink>
        }
      />
      <main className="mx-auto mb-10 max-w-[835px] space-y-8 px-6 sm:px-10 lg:px-0">
        <Message className="flex-col gap-8 px-0 py-16">
          <h2 className="text-h2">We couldn't find that page!</h2>
          <p className="text-lg">
            It looks like the page you requested has moved or no longer exists.
          </p>
        </Message>
        <SearchForm />
        <section>
          <h3 className="mb-8 text-h3">Featured Products</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.entityId} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export const runtime = 'edge';
