import { cs } from '@bigcommerce/reactant/cs';
import { Message } from '@bigcommerce/reactant/Message';

import { SearchForm } from 'components/SearchForm';
import client from '~/client';
import { Footer } from '~/components/Footer/Footer';
import { Header } from '~/components/Header';
import { ProductCard } from '~/components/ProductCard';

export default async function NotFound() {
  const featuredProducts = await client.getFeaturedProducts();

  return (
    <>
      <Header />
      <main className="mx-auto mb-10 flex max-w-[835px] flex-col justify-center gap-10 px-6 sm:px-10 lg:px-0 2xl:px-0">
        <Message className="flex-col gap-8 px-0 py-16">
          <h2 className="text-h2">We couldn't find that page!</h2>
          <p className="text-lg">
            It looks like the page you requested has moved or no longer exists.
          </p>
        </Message>
        <SearchForm />
        <section className={cs('w-full')}>
          <h3 className={cs('mb-10 text-center text-h3 sm:text-left')}>Featured Products</h3>
          <div className={cs('grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4')}>
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
