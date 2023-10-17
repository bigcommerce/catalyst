import { cs } from '@bigcommerce/reactant/cs';
import {
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
  ProductCard as ReactantProductCard,
} from '@bigcommerce/reactant/ProductCard';
import { Rating } from '@bigcommerce/reactant/Rating';
import Image from 'next/image';
import Link from 'next/link';
import { useId } from 'react';

import { Cart } from './Cart';
import { Compare } from './Compare';

export interface Product {
  entityId: number;
  name: string;
  defaultImage?: {
    altText?: string;
    url?: string;
  } | null;
  path: string;
  brand?: {
    name: string;
  } | null;
  prices?: {
    price?: {
      value?: number;
      currencyCode?: string;
    };
  } | null;
  reviewSummary?: {
    numberOfReviews: number;
    averageRating: number;
  } | null;
  productOptions?: Array<{
    entityId: number;
  }>;
}

interface ProductCardProps {
  product: Partial<Product>;
  imageSize?: 'tall' | 'wide' | 'square';
  imagePriority?: boolean;
}

export const ProductCard = ({
  product,
  imageSize = 'square',
  imagePriority = false,
}: ProductCardProps) => {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.prices?.price?.currencyCode,
  });

  const summaryId = useId();

  if (!product.entityId) {
    return null;
  }

  return (
    <ReactantProductCard key={product.entityId}>
      <ProductCardImage>
        <div
          className={cs('relative flex-auto', {
            'aspect-square': imageSize === 'square',
            'aspect-[4/5]': imageSize === 'tall',
            'aspect-[7/5]': imageSize === 'wide',
          })}
        >
          {product.defaultImage ? (
            <Image
              alt={product.defaultImage.altText ?? product.name ?? ''}
              className="object-contain"
              fill
              priority={imagePriority}
              src={product.defaultImage.url ?? ''}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>
      </ProductCardImage>
      <ProductCardInfo className="justify-end">
        {product.brand && <ProductCardInfoBrandName>{product.brand.name}</ProductCardInfoBrandName>}
        <ProductCardInfoProductName>
          {product.path ? (
            <Link
              className="focus:ring-primary-blue/20 focus:outline-none focus:ring-4"
              href={product.path}
            >
              <span aria-hidden="true" className="absolute inset-0 bottom-20" />
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </ProductCardInfoProductName>
        {product.reviewSummary && (
          <div className="flex items-center gap-3">
            <p
              aria-describedby={summaryId}
              className={cs(
                'flex flex-nowrap text-blue-primary',
                product.reviewSummary.numberOfReviews === 0 && 'text-gray-400',
              )}
            >
              <Rating size={16} value={product.reviewSummary.averageRating || 0} />
            </p>

            <div className="text-sm text-gray-500" id={summaryId}>
              {product.reviewSummary.averageRating !== 0 && (
                <>
                  <span className="sr-only">Rating:</span>
                  {product.reviewSummary.averageRating}
                  <span className="sr-only">out of 5 stars.</span>{' '}
                </>
              )}
              <span className="sr-only">Number of reviews:</span>(
              {product.reviewSummary.numberOfReviews})
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between pt-2">
          {product.prices?.price?.value !== undefined && (
            <ProductCardInfoPrice className="w-[144px] shrink-0 pt-0">
              {currencyFormatter.format(product.prices.price.value)}
            </ProductCardInfoPrice>
          )}
          <Compare productId={product.entityId} />
        </div>
      </ProductCardInfo>
      <Cart product={product} />
    </ReactantProductCard>
  );
};
