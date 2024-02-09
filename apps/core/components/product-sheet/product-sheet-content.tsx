'use client';

import { Rating } from '@bigcommerce/components/rating';
import { Loader2 as Spinner } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

import { getProduct } from '~/client/queries/get-product';
import { ProductForm } from '~/components/product-form';
import { cn } from '~/lib/utils';

export const ProductSheetContent = () => {
  const summaryId = useId();

  const searchParams = useSearchParams();
  const productId = searchParams.get('showQuickAdd');

  const [isError, setError] = useState(false);
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProduct>>>(null);

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

        const response = await fetch(url);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const productResponse: Awaited<ReturnType<typeof getProduct>> = await response.json();

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
        <span>An error has ocurred.</span>
      </div>
    );
  }

  if (product) {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.prices?.price.currencyCode,
    });

    const showPriceRange =
      product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

    return (
      <>
        <div className="flex">
          <div className="square relative h-[144px] w-[144px] shrink-0 grow-0">
            {product.defaultImage ? (
              <Image
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
                  'flex flex-nowrap text-blue-primary',
                  product.reviewSummary.numberOfReviews === 0 && 'text-gray-400',
                )}
              >
                <Rating size={16} value={product.reviewSummary.averageRating || 0} />
              </p>

              <div className="text-xs font-normal text-gray-500" id={summaryId}>
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

            {product.prices && (
              <div>
                {showPriceRange ? (
                  <span>
                    {currencyFormatter.format(product.prices.priceRange.min.value)} -{' '}
                    {currencyFormatter.format(product.prices.priceRange.max.value)}
                  </span>
                ) : (
                  <>
                    {product.prices.retailPrice?.value !== undefined && (
                      <span>
                        MSRP:{' '}
                        <span className="line-through">
                          {currencyFormatter.format(product.prices.retailPrice.value)}
                        </span>
                        <br />
                      </span>
                    )}
                    {product.prices.salePrice?.value !== undefined &&
                    product.prices.basePrice?.value !== undefined ? (
                      <>
                        <span>
                          Was:{' '}
                          <span className="line-through">
                            {currencyFormatter.format(product.prices.basePrice.value)}
                          </span>
                        </span>
                        <br />
                        <span>Now: {currencyFormatter.format(product.prices.salePrice.value)}</span>
                      </>
                    ) : (
                      product.prices.price.value && (
                        <span>{currencyFormatter.format(product.prices.price.value)}</span>
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
  }

  return (
    <div className="flex h-full w-full items-center justify-center text-blue-primary">
      <Spinner aria-hidden="true" className="animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
