import { Product } from '@bigcommerce/catalyst-client';
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
import { PartialDeep } from 'type-fest';

interface ProductCardProps {
  product: PartialDeep<Product>;
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
      <ProductCardInfo>
        {product.brand && <ProductCardInfoBrandName>{product.brand.name}</ProductCardInfoBrandName>}
        <ProductCardInfoProductName>
          <Link href={`/product/${product.entityId}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
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
              <Rating size={13} value={product.reviewSummary.averageRating || 0} />
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
        {product.prices?.price?.value !== undefined && (
          <ProductCardInfoPrice>
            {currencyFormatter.format(product.prices.price.value)}
          </ProductCardInfoPrice>
        )}
      </ProductCardInfo>
    </ReactantProductCard>
  );
};
