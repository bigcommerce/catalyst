'use client';

import { Button } from '@bigcommerce/components/Button';
import { Rating } from '@bigcommerce/components/Rating';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from '@bigcommerce/components/Sheet';
import { Loader2 as Spinner } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { PropsWithChildren, useEffect, useId, useState } from 'react';

import { getProduct } from '~/client/queries/get-product';
import { ProductForm } from '~/components/product-form';
import { cn } from '~/lib/utils';

export const ProductSheet = ({ children, title }: PropsWithChildren<{ title: string }>) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className="mt-2">{title}</Button>
      </SheetTrigger>
      <SheetOverlay className="bg-transparent, backdrop-blur-none">
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle asChild>
              <h2>Choose options</h2>
            </SheetTitle>
            <SheetClose />
          </SheetHeader>
          {open && children}
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
};

export const ProductSheetContent = ({ productId }: { productId: number }) => {
  const summaryId = useId();
  const searchParams = useSearchParams();
  const [isError, setError] = useState(false);
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProduct>>>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setError(false);

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

            <h5 className="mb-2 text-h5">{product.name}</h5>

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

            {product.prices && (
              <div>
                {showPriceRange ? (
                  <p className="text-h4">
                    {currencyFormatter.format(product.prices.priceRange.min.value)} -{' '}
                    {currencyFormatter.format(product.prices.priceRange.max.value)}
                  </p>
                ) : (
                  <>
                    {product.prices.retailPrice?.value !== undefined && (
                      <p className="text-h4">
                        MSRP:{' '}
                        <span className="line-through">
                          {currencyFormatter.format(product.prices.retailPrice.value)}
                        </span>
                      </p>
                    )}
                    {product.prices.salePrice?.value !== undefined &&
                    product.prices.basePrice?.value !== undefined ? (
                      <>
                        Was:{' '}
                        <span className="line-through">
                          {currencyFormatter.format(product.prices.basePrice.value)}
                        </span>
                        <br />
                        <>Now: {currencyFormatter.format(product.prices.salePrice.value)}</>
                      </>
                    ) : (
                      product.prices.price.value && (
                        <>{currencyFormatter.format(product.prices.price.value)}</>
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
