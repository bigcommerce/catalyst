import {
  ProductCard as ComponentsProductCard,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
} from '@bigcommerce/components/product-card';
import { Rating } from '@bigcommerce/components/rating';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import { BcImage } from '../bc-image';
import { Pricing } from '../pricing';

import { Cart } from './cart';
import { Compare } from './compare';

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
    path: string;
  } | null;
  prices?: {
    price?: {
      value?: number;
      currencyCode?: string;
    };
    basePrice?: {
      value?: number;
      currencyCode?: string;
    } | null;
    retailPrice?: {
      value?: number;
      currencyCode?: string;
    } | null;
    salePrice?: {
      value?: number;
      currencyCode?: string;
    } | null;
    priceRange?: {
      min?: {
        value?: number;
        currencyCode?: string;
      } | null;
      max?: {
        value?: number;
        currencyCode?: string;
      } | null;
    } | null;
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
  showCart?: boolean;
  showCompare?: boolean;
  showReviews?: boolean;
}

export const ProductCard = ({
  product,
  imageSize = 'square',
  imagePriority = false,
  showCart = true,
  showCompare = true,
  showReviews = true,
}: ProductCardProps) => {
  const summaryId = useId();
  const t = useTranslations('Product.ProductSheet');

  if (!product.entityId) {
    return null;
  }

  return (
    <ComponentsProductCard key={product.entityId}>
      <ProductCardImage>
        <div
          className={cn('relative flex-auto', {
            'aspect-square': imageSize === 'square',
            'aspect-[4/5]': imageSize === 'tall',
            'aspect-[7/5]': imageSize === 'wide',
          })}
        >
          {product.defaultImage ? (
            <BcImage
              alt={product.defaultImage.altText ?? product.name ?? ''}
              className="object-contain"
              fill
              priority={imagePriority}
              sizes="(max-width: 768px) 50vw, (max-width: 1536px) 25vw, 500px"
              src={product.defaultImage.url ?? ''}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>
      </ProductCardImage>
      <ProductCardInfo className={cn(showCart && 'justify-end')}>
        {product.brand && <ProductCardInfoBrandName>{product.brand.name}</ProductCardInfoBrandName>}
        <ProductCardInfoProductName>
          {product.path ? (
            <Link
              className="focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
              href={product.path}
            >
              <span aria-hidden="true" className="absolute inset-0 bottom-20" />
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </ProductCardInfoProductName>
        {product.reviewSummary && showReviews && (
          <div className="flex items-center gap-3">
            <p
              aria-describedby={summaryId}
              className={cn(
                'flex flex-nowrap text-primary',
                product.reviewSummary.numberOfReviews === 0 && 'text-gray-400',
              )}
            >
              <Rating size={16} value={product.reviewSummary.averageRating || 0} />
            </p>

            <div className="text-xs font-normal text-gray-500" id={summaryId}>
              {product.reviewSummary.averageRating !== 0 && (
                <>
                  {t.rich('productRating', {
                    currentRating: product.reviewSummary.averageRating,
                    rating: (chunks) => <span className="sr-only">{chunks}</span>,
                    stars: (chunks) => <span className="sr-only">{chunks}</span>,
                  })}
                </>
              )}
              <span className="sr-only">{t('numberReviews')}</span>(
              {product.reviewSummary.numberOfReviews})
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between pt-1">
          <ProductCardInfoPrice>
            <Pricing prices={product.prices} />
          </ProductCardInfoPrice>
          {showCompare && (
            <Compare
              productId={product.entityId}
              productImage={product.defaultImage}
              productName={product.name ?? ''}
            />
          )}
        </div>
      </ProductCardInfo>
      {showCart && <Cart product={product} />}
    </ComponentsProductCard>
  );
};
