import { Suspense } from 'react';

import { getProduct } from '~/client/queries/get-product';
import { ProductForm } from '~/components/product-form';

import { ProductSchema } from './product-schema';
import { ReviewSummary } from './review-summary';

type Product = Awaited<ReturnType<typeof getProduct>>;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const Details = ({ product }: { product: NonNullable<Product> }) => {
  const showPriceRange =
    product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

  return (
    <div>
      {product.brand && (
        <p className="mb-2 font-semibold uppercase text-gray-500">{product.brand.name}</p>
      )}

      <h1 className="mb-4 text-4xl font-black lg:text-5xl">{product.name}</h1>

      <Suspense fallback="Loading...">
        <ReviewSummary productId={product.entityId} />
      </Suspense>

      {product.prices && (
        <div className="my-6 text-2xl font-bold lg:text-3xl">
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

      <ProductForm product={product} />

      <div className="my-12">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Additional details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Boolean(product.sku) && (
            <div>
              <h3 className="font-semibold">SKU</h3>
              <p>{product.sku}</p>
            </div>
          )}
          {Boolean(product.upc) && (
            <div>
              <h3 className="font-semibold">UPC</h3>
              <p>{product.upc}</p>
            </div>
          )}
          {Boolean(product.minPurchaseQuantity) && (
            <div>
              <h3 className="font-semibold">Minimum purchase</h3>
              <p>{product.minPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.maxPurchaseQuantity) && (
            <div>
              <h3 className="font-semibold">Maxiumum purchase</h3>
              <p>{product.maxPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.availabilityV2.description) && (
            <div>
              <h3 className="font-semibold">Availability</h3>
              <p>{product.availabilityV2.description}</p>
            </div>
          )}
          {Boolean(product.condition) && (
            <div>
              <h3 className="font-semibold">Condition</h3>
              <p>{product.condition}</p>
            </div>
          )}
          {Boolean(product.weight) && (
            <div>
              <h3 className="font-semibold">Weight</h3>
              <p>
                {product.weight?.value} {product.weight?.unit}
              </p>
            </div>
          )}
          {Boolean(product.customFields) &&
            product.customFields.map((customField) => (
              <div key={customField.entityId}>
                <h3 className="font-semibold">{customField.name}</h3>
                <p>{customField.value}</p>
              </div>
            ))}
        </div>
      </div>
      <ProductSchema product={product} />
    </div>
  );
};
