import { Button } from '@bigcommerce/reactant/Button';
import { Heart } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import client from '~/client';

import { AddToCart } from './AddToCart';
import { BreadCrumbs } from './Breadcrumbs';
import { Gallery } from './Gallery';
import { Reviews } from './Reviews';
import { ReviewSummary } from './ReviewSummary';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default async function Product({ params }: { params: { slug: string } }) {
  const productId = Number(params.slug);
  const product = await client.getProduct(productId);

  const reviewSectionId = 'write-a-review';

  if (!product) {
    return notFound();
  }

  return (
    <>
      <BreadCrumbs productId={productId} />

      <div className="my-6 grid-cols-2 gap-4 md:grid">
        <div className="md:order-2">
          {product.brand && (
            <p className="font-semibold uppercase text-gray-500">{product.brand.name}</p>
          )}

          <h1 className="mb-3 text-h2">{product.name}</h1>

          <Suspense fallback="Loading...">
            <ReviewSummary productId={productId} reviewSectionId={reviewSectionId} />
          </Suspense>

          {product.prices && (
            <div className="my-7">
              <p className="text-h4">{currencyFormatter.format(product.prices.price.value)}</p>
            </div>
          )}

          <div className="my-7 flex gap-4">
            <AddToCart productId={productId} />

            {/* NOT IMPLEMENTED YET */}
            <div className="w-full">
              <Button type="submit" variant="secondary">
                <Heart aria-hidden="true" className="mx-2" />
                <span>Save to wishlist</span>
              </Button>
            </div>
          </div>

          {/* <Variants productId={productId} /> */}
        </div>

        <div className="md:order-1">
          <Gallery productId={productId} />

          {Boolean(product.plainTextDescription) && (
            <>
              <h3 className="mb-4 text-h5">Description</h3>
              <p>{product.plainTextDescription}</p>
            </>
          )}

          {Boolean(product.warranty) && (
            <>
              <h3 className="mb-4 mt-8 text-h5">Warranty</h3>
              <p>{product.warranty}</p>
            </>
          )}

          <Suspense fallback="Loading...">
            <Reviews productId={productId} reviewSectionId={reviewSectionId} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

export const runtime = 'edge';
