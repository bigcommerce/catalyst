import { getBestSellingProducts, getFeaturedProducts } from '@bigcommerce/catalyst-client';
import { cs } from '@bigcommerce/reactant/cs';
import {
  ProductCardBadge,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
  ProductCard as ReactantProductCard,
} from '@bigcommerce/reactant/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
type BestSellingProduct = Awaited<ReturnType<typeof getBestSellingProducts>>[number];

interface ProductCardProps {
  product: FeaturedProduct | BestSellingProduct;
}

const ProductCard = ({ product }: ProductCardProps) => (
  <ReactantProductCard key={product.entityId}>
    <ProductCardImage>
      <Image
        alt={product.defaultImage?.altText ?? product.name}
        className="h-full w-full object-contain object-center sm:h-full sm:w-full"
        height={300}
        src={product.defaultImage?.url ?? ''}
        width={300}
      />
    </ProductCardImage>
    <ProductCardBadge>On sale</ProductCardBadge>
    <ProductCardInfo>
      {product.brand && <ProductCardInfoBrandName>{product.brand.name}</ProductCardInfoBrandName>}
      <ProductCardInfoProductName>
        <Link href={`/product/${product.entityId}`}>
          <span aria-hidden="true" />
          {product.name}
        </Link>
      </ProductCardInfoProductName>
      <ProductCardInfoPrice>${product.price?.value}</ProductCardInfoPrice>
    </ProductCardInfo>
  </ReactantProductCard>
);

const ProductList = ({ children }: { children: ReactNode }) => (
  <section className={cs('mb-10')}>{children}</section>
);

const ProductListName = ({ children }: { children: ReactNode }) => (
  <h3 className={cs('mb-10 text-center text-h3 sm:text-left')}>{children}</h3>
);

const ProductListGrid = ({ children }: { children: ReactNode }) => (
  <div
    className={cs('grid grid-cols-2 gap-y-8 gap-x-6 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4')}
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
