import { cs } from '@bigcommerce/reactant/cs';
import { ReactNode } from 'react';

import client from '~/client';
import { Hero } from '~/components/Hero';
import { ProductCard } from '~/components/ProductCard';

const ProductList = ({ children }: { children: ReactNode }) => (
  <section className={cs('mb-10')}>{children}</section>
);

const ProductListName = ({ children }: { children: ReactNode }) => (
  <h2 className={cs('mb-10 text-center text-h3 sm:text-left')}>{children}</h2>
);

const ProductListGrid = ({ children }: { children: ReactNode }) => (
  <div className={cs('grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4')}>{children}</div>
);

export default async function Home() {
  const [bestSellingProducts, featuredProducts] = await Promise.all([
    client.getBestSellingProducts(),
    client.getFeaturedProducts(),
  ]);

  return (
    <>
      <Hero />
      <div className="my-10">
        <ProductList>
          <ProductListName>Best Selling Products</ProductListName>
          <ProductListGrid>
            {bestSellingProducts.map((product) => (
              <ProductCard imageSize="tall" key={product.entityId} product={product} />
            ))}
          </ProductListGrid>
        </ProductList>

        <ProductList>
          <ProductListName>Featured Products</ProductListName>
          <ProductListGrid>
            {featuredProducts.map((product) => (
              <ProductCard key={product.entityId} product={product} />
            ))}
          </ProductListGrid>
        </ProductList>
      </div>
    </>
  );
}

export const runtime = 'edge';
