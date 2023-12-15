'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { Counter } from '@bigcommerce/reactant/Counter';
import { Label } from '@bigcommerce/reactant/Label';
import { Rating } from '@bigcommerce/reactant/Rating';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from '@bigcommerce/reactant/Sheet';
import { Loader2 as Spinner } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ComponentPropsWithoutRef,
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { useFormStatus } from 'react-dom';

import { ProductForm } from '~/app/(default)/product/[slug]/_components/ProductForm';
import { getProduct } from '~/client/queries/getProduct';
import { VariantSelector } from '~/components/VariantSelector';
import { cn } from '~/lib/utils';

const ProductContext = createContext<{ product: Awaited<ReturnType<typeof getProduct>> }>({
  product: null,
});

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

export const ProductSheetContent = ({
  productId,
  children,
}: PropsWithChildren<{ productId: number }>) => {
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
          <div className={cn('square relative h-[144px] w-[144px] shrink-0 grow-0')}>
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
                    {product.prices.basePrice?.value !== undefined && (
                      <p className="text-h4">
                        {product.prices.salePrice?.value ? (
                          <>
                            Was:{' '}
                            <span className="line-through">
                              {currencyFormatter.format(product.prices.basePrice.value)}
                            </span>
                          </>
                        ) : (
                          currencyFormatter.format(product.prices.basePrice.value)
                        )}
                      </p>
                    )}
                    {product.prices.salePrice?.value !== undefined && (
                      <p className="text-h4">
                        Now: {currencyFormatter.format(product.prices.salePrice.value)}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <ProductContext.Provider value={{ product }}>{children}</ProductContext.Provider>
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

const SubmitButton = ({ children }: PropsWithChildren) => {
  const { pending } = useFormStatus();

  return (
    <Button className={cn('mt-6')} disabled={pending} type="submit">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </Button>
  );
};

export const ProductSheetForm = ({ children }: ComponentPropsWithoutRef<'form'>) => {
  const { product } = useContext(ProductContext);

  if (!product) {
    return null;
  }

  return (
    <ProductForm>
      <input name="product_id" type="hidden" value={product.entityId} />
      <VariantSelector product={product} />
      <div>
        <Label className="my-2 inline-block font-semibold" htmlFor="quantity">
          Quantity
        </Label>
        <Counter id="quantity" min={1} name="quantity" />
      </div>
      {children || <SubmitButton>Add to cart</SubmitButton>}
    </ProductForm>
  );
};
