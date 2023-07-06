import { getBestSellingProducts, getFeaturedProducts } from '@bigcommerce/catalyst-client';
import { cs } from '@bigcommerce/reactant/cs';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
type BestSellingProduct = Awaited<ReturnType<typeof getBestSellingProducts>>[number];

interface ProductCardProps {
  product: FeaturedProduct | BestSellingProduct;
}

const ProductCard = ({ product }: ProductCardProps) => (
  <div className="group relative mx-auto flex flex-col overflow-hidden" key={product.entityId}>
    <div className="mx-auto h-[300px] w-[300px] group-hover:opacity-75">
      <Image
        alt={product.defaultImage?.altText ?? product.name}
        className="h-full w-full object-cover object-center sm:h-full sm:w-full"
        height={300}
        src={product.defaultImage?.url ?? ''}
        width={300}
      />
    </div>

    <div className="flex w-[400px] flex-1 flex-col justify-end space-y-2 p-4 sm:w-auto">
      {product.brand && <p className="text-base text-gray-500">{product.brand.name}</p>}

      <h3 className="text-h5">
        <Link href={`/product/${product.entityId}`}>
          <span aria-hidden="true" className="absolute inset-0" />
          {product.name}
        </Link>
      </h3>

      <div className="flex flex-col justify-end">
        <p className="text-base">${product.price?.value}</p>
      </div>
    </div>
  </div>
);

const ProductList = ({ children }: { children: ReactNode }) => (
  <section className={cs('mb-10')}>{children}</section>
);

const ProductListName = ({ children }: { children: ReactNode }) => (
  <h3 className={cs('mb-10 text-center text-h3 sm:text-left')}>{children}</h3>
);

const ProductListGrid = ({ children }: { children: ReactNode }) => (
  <div
    className={cs(
      'grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4',
    )}
  >
    {children}
  </div>
);

export default async function Home() {
  const [bestSellingProducts, featuredProducts] = await Promise.all([
    getBestSellingProducts(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="my-10">
      <ProductList>
        <ProductListName>Best Selling Products</ProductListName>
        <ProductListGrid>
          {bestSellingProducts.map((product) => (
            <ProductCard key={product.entityId} product={product} />
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
  );
}

export const runtime = 'edge';
