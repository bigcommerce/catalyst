import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { addCartLineItem, createCart, getProduct } from '@client';

import { BreadCrumbs } from './Breadcrumbs';
import { Gallery } from './Gallery';
import { Reviews } from './Reviews';
import { ReviewSummary } from './ReviewSummary';
// import { Variants } from './Variants';

export default async function Product({ params }: { params: { slug: string } }) {
  const productId = Number(params.slug);
  const product = await getProduct(productId);

  const reviewSectionId = 'write-a-review';

  if (!product) {
    return notFound();
  }

  const handleAddToCart = async () => {
    'use server';

    const cartId = cookies().get('cartId')?.value;

    if (cartId) {
      await addCartLineItem(cartId, {
        lineItems: [
          {
            productEntityId: productId,
            quantity: 1,
          },
        ],
      });

      revalidateTag('cart');

      return;
    }

    // Create cart
    const cart = await createCart([
      {
        productEntityId: productId,
        quantity: 1,
      },
    ]);

    if (cart) {
      cookies().set({
        name: 'cartId',
        value: cart.entityId,
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });
    }

    revalidateTag('cart');
  };

  return (
    <>
      {/* @ts-expect-error Server Component */}
      <BreadCrumbs productId={productId} />

      <div className="my-6 grid-cols-2 gap-4 md:grid">
        <div className="md:order-2">
          {product.brand && (
            <p className="text-md font-semibold uppercase text-slate-500">{product.brand.name}</p>
          )}
          <h1 className="mb-3 text-[50px] font-black leading-[66px] text-black">{product.name}</h1>
          <Suspense fallback="Loading...">
            {/* @ts-expect-error Server Component */}
            <ReviewSummary productId={productId} reviewSectionId={reviewSectionId} />
          </Suspense>

          <form action={handleAddToCart} className="my-6">
            <button className="bg-blue-800 text-white" type="submit">
              Add to Cart
            </button>
          </form>

          {/* <Variants productId={productId} /> */}
        </div>

        <div className="md:order-1">
          {/* @ts-expect-error Server Component */}
          <Gallery productId={productId} />

          {Boolean(product.plainTextDescription) && (
            <>
              <h2 className="mb-4 text-xl font-bold">Description</h2>
              <p>{product.plainTextDescription}</p>
            </>
          )}

          {Boolean(product.warranty) && (
            <>
              <h2 className="mb-4 mt-8 text-xl font-bold">Warranty</h2>
              <p>{product.warranty}</p>
            </>
          )}

          <Suspense fallback="Loading...">
            {/* @ts-expect-error Server Component */}
            <Reviews productId={productId} reviewSectionId={reviewSectionId} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

export const runtime = 'experimental-edge';
