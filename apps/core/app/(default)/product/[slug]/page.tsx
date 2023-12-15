import { Button } from '@bigcommerce/reactant/Button';
import { Counter } from '@bigcommerce/reactant/Counter';
import { Label } from '@bigcommerce/reactant/Label';
import { Heart } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getProduct } from '~/client/queries/getProduct';
import { VariantSelector } from '~/components/VariantSelector';

import { AddToCart } from './_components/AddToCart';
import { BreadCrumbs } from './_components/Breadcrumbs';
import { Gallery } from './_components/Gallery';
import { ProductForm } from './_components/ProductForm';
import { ProductSchema } from './_components/ProductSchema';
import { RelatedProducts } from './_components/RelatedProducts';
import { Reviews } from './_components/Reviews';
import { ReviewSummary } from './_components/ReviewSummary';

type Product = Awaited<ReturnType<typeof getProduct>>;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const ProductDetails = ({ product }: { product: NonNullable<Product> }) => {
  const showPriceRange =
    product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

  return (
    <div>
      {product.brand && (
        <p className="mb-2 font-semibold uppercase text-gray-500">{product.brand.name}</p>
      )}

      <h1 className="mb-4 text-h2">{product.name}</h1>

      <Suspense fallback="Loading...">
        <ReviewSummary productId={product.entityId} />
      </Suspense>

      {product.prices && (
        <div className="my-6">
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

      <ProductForm>
        <input name="product_id" type="hidden" value={product.entityId} />

        <VariantSelector product={product} />

        <div className="sm:w-32">
          <Label className="my-2 inline-block font-semibold" htmlFor="quantity">
            Quantity
          </Label>
          <Counter id="quantity" min={1} name="quantity" required />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <AddToCart disabled={product.availabilityV2.status === 'Unavailable'} />

          {/* NOT IMPLEMENTED YET */}
          <div className="w-full">
            <Button disabled type="submit" variant="secondary">
              <Heart aria-hidden="true" className="mx-2" />
              <span>Save to wishlist</span>
            </Button>
          </div>
        </div>
      </ProductForm>

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
          {Boolean(product.availabilityV2.description) && (
            <div>
              <h3 className="text-base font-bold">Availability</h3>
              <p>{product.availabilityV2.description}</p>
            </div>
          )}
          {Boolean(product.condition) && (
            <div>
              <h3 className="text-base font-bold">Condition</h3>
              <p>{product.condition}</p>
            </div>
          )}
          {Boolean(product.weight) && (
            <div>
              <h3 className="text-base font-bold">Weight</h3>
              <p>
                {product.weight?.value} {product.weight?.unit}
              </p>
            </div>
          )}
          {Boolean(product.customFields) &&
            product.customFields.map((customField) => (
              <div key={customField.entityId}>
                <h3 className="text-base font-bold">{customField.name}</h3>
                <p>{customField.value}</p>
              </div>
            ))}
        </div>
      </div>
      <ProductSchema product={product} />
    </div>
  );
};

const ProductDescriptionAndReviews = ({ product }: { product: NonNullable<Product> }) => {
  return (
    <div className="lg:col-span-2">
      {Boolean(product.description) && (
        <>
          <h2 className="mb-4 text-h5">Description</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </>
      )}

      {Boolean(product.warranty) && (
        <>
          <h2 className="mb-4 mt-8 text-h5">Warranty</h2>
          <p>{product.warranty}</p>
        </>
      )}

      <Suspense fallback="Loading...">
        <Reviews productId={product.entityId} />
      </Suspense>
    </div>
  );
};

interface ProductPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productId = Number(params.slug);
  const product = await getProduct(productId);

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function Product({ params, searchParams }: ProductPageProps) {
  const productId = Number(params.slug);
  const { slug, ...options } = searchParams;

  const optionValueIds = Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );

  const product = await getProduct(productId, optionValueIds);

  if (!product) {
    return notFound();
  }

  // make a copy of product.images
  const images = product.images;

  // pick the top-level default image out of the `Image` response
  const topLevelDefaultImg = product.images.find((image) => image.isDefault);

  // if product.defaultImage exists, and product.defaultImage.url is not equal to the url of the isDefault image in the Image response, mark the existing isDefault image to "isDefault = false" and append the correct default image to images
  if (product.defaultImage && topLevelDefaultImg?.url !== product.defaultImage.url) {
    images.forEach((image) => {
      image.isDefault = false;
    });

    images.push({
      url: product.defaultImage.url,
      altText: product.defaultImage.altText,
      isDefault: true,
    });
  }

  return (
    <>
      <BreadCrumbs productId={productId} />
      <div className="mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
        <Gallery images={images} />
        <ProductDetails product={product} />
        <ProductDescriptionAndReviews product={product} />
      </div>

      <Suspense fallback="Loading...">
        <RelatedProducts optionValueIds={optionValueIds} productId={productId} />
      </Suspense>
    </>
  );
}

export const runtime = 'edge';
