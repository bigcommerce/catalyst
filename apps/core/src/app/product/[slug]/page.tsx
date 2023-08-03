import { Product } from '@bigcommerce/catalyst-client';
import { Button } from '@bigcommerce/reactant/Button';
import { cs } from '@bigcommerce/reactant/cs';
import { Heart } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import client from '~/client';
import { assertNonNullable } from '~/utils';

import { AddToCart } from './AddToCart';
import { BreadCrumbs } from './Breadcrumbs';
import { Gallery } from './Gallery';
import { Reviews } from './Reviews';
import { ReviewSummary } from './ReviewSummary';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const ProductDetails = async ({ productId }: { productId: number }) => {
  const product = await client.getProduct(productId);
  const reviewSectionId = 'write-a-review';

  assertNonNullable(product);

  return (
    <div>
      {product.brand && (
        <p className="mb-2 font-semibold uppercase text-gray-500">{product.brand.name}</p>
      )}

      <h1 className="mb-4 text-h2">{product.name}</h1>

      <Suspense fallback="Loading...">
        <ReviewSummary productId={productId} reviewSectionId={reviewSectionId} />
      </Suspense>

      {product.prices && (
        <div className="my-6">
          <p className="text-h4">{currencyFormatter.format(product.prices.price.value)}</p>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <AddToCart productId={productId} />

        {/* NOT IMPLEMENTED YET */}
        <div className="w-full">
          <Button disabled type="submit" variant="secondary">
            <Heart aria-hidden="true" className="mx-2" />
            <span>Save to wishlist</span>
          </Button>
        </div>
      </div>

      <div className="my-12">
        <h2 className="mb-4 text-h5">Additional details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Boolean(product.sku) && (
            <div>
              <h3 className="text-base font-bold">SKU</h3>
              <p>{product.sku}</p>
            </div>
          )}
          {Boolean(product.upc) && (
            <div>
              <h3 className="text-base font-bold">UPC</h3>
              <p>{product.upc}</p>
            </div>
          )}
          {Boolean(product.minPurchaseQuantity) && (
            <div>
              <h3 className="text-base font-bold">Minimum purchase</h3>
              <p>{product.minPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.maxPurchaseQuantity) && (
            <div>
              <h3 className="text-base font-bold">Maxiumum purchase</h3>
              <p>{product.maxPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.availabilityV2) && (
            <div>
              <h3 className="text-base font-bold">Availability</h3>
              <p>{product.availabilityV2.status}</p>
            </div>
          )}
          {Boolean(product.condition) && (
            <div>
              <h3 className="text-base font-bold">Condition</h3>
              <p>{product.condition}</p>
            </div>
          )}
        </div>
      </div>

      {/* <Variants productId={productId} /> */}
    </div>
  );
};

const ProductDescriptionAndReviews = async ({
  className,
  productId,
}: {
  className?: string;
  productId: number;
}) => {
  const product = await client.getProduct(productId);
  const reviewSectionId = 'write-a-review';

  assertNonNullable(product);

  return (
    <div className={cs(className)}>
      {Boolean(product.plainTextDescription) && (
        <>
          <h2 className="mb-4 text-h5">Description</h2>
          <p>{product.plainTextDescription}</p>
        </>
      )}

      {Boolean(product.warranty) && (
        <>
          <h2 className="mb-4 mt-8 text-h5">Warranty</h2>
          <p>{product.warranty}</p>
        </>
      )}

      <Suspense fallback="Loading...">
        <Reviews productId={productId} reviewSectionId={reviewSectionId} />
      </Suspense>
    </div>
  );
};

export default async function Product({ params }: { params: { slug: string } }) {
  const productId = Number(params.slug);
  const product = await client.getProduct(productId);

  if (!product) {
    return notFound();
  }

  return (
    <>
      <BreadCrumbs productId={productId} />
      <div className="mt-4 mb-12 lg:grid lg:grid-cols-2 lg:gap-8">
        <div>
          <Gallery productId={productId} />
          <ProductDescriptionAndReviews className="hidden lg:block" productId={productId} />
        </div>
        <ProductDetails productId={productId} />
        <ProductDescriptionAndReviews className="lg:hidden" productId={productId} />
      </div>
    </>
  );
}

export const runtime = 'edge';
