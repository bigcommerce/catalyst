'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ProductForm } from '~/components/product-form';
import { Rating } from '~/components/ui/rating';
import { cn } from '~/lib/utils';

import { BcImage } from '../bc-image';

import { ProductSheetContentFragment } from './fragment';

type Product = FragmentOf<typeof ProductSheetContentFragment>;

export const ProductSheetContent = () => {
  const summaryId = useId();
  const t = useTranslations('Product.ProductSheet');
  const format = useFormatter();

  const searchParams = useSearchParams();
  const productId = searchParams.get('showQuickAdd');

  const [isError, setError] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setError(false);

      if (!productId) {
        setError(true);

        return;
      }

      try {
        const paramsString = searchParams.toString();
        const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

        const url = `/api/product/${productId}${queryString}`;

        const response = await fetch(url, {
          headers: {
            'x-catalyst-product-sheet': 'true',
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const productResponse: Product = await response.json();

        setProduct(productResponse);
      } catch (error) {
        setError(true);
      }
    };

    void fetchProduct();
  }, [productId, searchParams]);

  if (isError) {
    return (
      <div className="flex h-full w-full">
        <span>{t('errorMessage')}</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-full w-full items-center justify-center text-primary">
        <Spinner aria-hidden="true" className="animate-spin" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  const showPriceRange =
    product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

  return (
    <>
      <div className="flex">
        <div className="square relative h-[144px] w-[144px] shrink-0 grow-0">
          {product.defaultImage ? (
            <BcImage
              alt={product.defaultImage.altText}
              className="object-contain"
              fill
              priority={false}
              src={product.defaultImage.url}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>
        <div className="flex-shrink ps-4">
          {product.brand && (
            <p className="mb-2 font-semibold uppercase text-gray-500">{product.brand.name}</p>
          )}

          <h5 className="mb-2 text-xl font-bold lg:text-2xl">{product.name}</h5>

          <div className="mb-2 flex items-center gap-3">
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

          {product.prices && (
            <div>
              {showPriceRange ? (
                <span>
                  {format.number(product.prices.priceRange.min.value, {
                    style: 'currency',
                    currency: product.prices.price.currencyCode,
                  })}{' '}
                  -{' '}
                  {format.number(product.prices.priceRange.max.value, {
                    style: 'currency',
                    currency: product.prices.price.currencyCode,
                  })}
                </span>
              ) : (
                <>
                  {product.prices.retailPrice?.value !== undefined && (
                    <span>
                      {t('msrp')}{' '}
                      <span className="line-through">
                        {format.number(product.prices.retailPrice.value, {
                          style: 'currency',
                          currency: product.prices.price.currencyCode,
                        })}
                      </span>
                      <br />
                    </span>
                  )}
                  {product.prices.salePrice?.value !== undefined &&
                  product.prices.basePrice?.value !== undefined ? (
                    <>
                      <span>
                        {t('was')}{' '}
                        <span className="line-through">
                          {format.number(product.prices.basePrice.value, {
                            style: 'currency',
                            currency: product.prices.price.currencyCode,
                          })}
                        </span>
                      </span>
                      <br />
                      <span>
                        {t('now')}{' '}
                        {format.number(product.prices.salePrice.value, {
                          style: 'currency',
                          currency: product.prices.price.currencyCode,
                        })}
                      </span>
                    </>
                  ) : (
                    product.prices.price.value && (
                      <span>
                        {format.number(product.prices.price.value, {
                          style: 'currency',
                          currency: product.prices.price.currencyCode,
                        })}
                      </span>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <ProductForm product={product} />
    </>
  );
};
