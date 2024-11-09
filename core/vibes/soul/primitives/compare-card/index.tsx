import clsx from 'clsx';

import { Button } from '@/vibes/soul/primitives/button';
import {
  CardProduct,
  ProductCard,
  ProductCardSkeleton,
} from '@/vibes/soul/primitives/product-card';
import { Rating } from '@/vibes/soul/primitives/rating';

export type CompareProduct = CardProduct & {
  description?: string;
  customFields?: Array<{ name: string; value: string }>;
};

export type Props = {
  className?: string;
  product: CompareProduct;
  addToCartLabel?: string;
  descriptionLabel?: string;
  ratingLabel?: string;
  otherDetailsLabel?: string;
  addToCartAction?(id: string): Promise<void>;
};

export function CompareCard({
  className,
  product,
  addToCartAction,
  addToCartLabel = 'Add to cart',
  descriptionLabel = 'Description',
  ratingLabel = 'Rating',
  otherDetailsLabel = 'Other details',
}: Props) {
  return (
    <div
      className={clsx('flex w-full flex-col divide-y divide-contrast-100 @container', className)}
    >
      <div className="mb-2 space-y-4 pb-4">
        <ProductCard product={product} />
        {addToCartAction && (
          <form action={addToCartAction.bind(null, product.id)}>
            <Button className="w-full" size="medium" type="submit">
              {addToCartLabel}
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-4 py-4">
        <div className="font-mono text-xs uppercase">{ratingLabel}</div>
        {product.rating != null ? (
          <Rating rating={product.rating} />
        ) : (
          <p className="text-sm text-contrast-400"> There are no reviews.</p>
        )}
      </div>

      <div className="space-y-4 py-4">
        <div className="font-mono text-xs uppercase">{descriptionLabel}</div>
        {product.description != null && product.description !== '' ? (
          <p className="text-sm">{product.description}</p>
        ) : (
          <p className="text-sm text-contrast-400"> There is no description available.</p>
        )}
      </div>

      {product.customFields != null ? (
        <div className="space-y-4 py-4">
          <div className="font-mono text-xs uppercase">{otherDetailsLabel}</div>
          {product.customFields.map((field, index) => (
            <div key={index}>
              <p className="text-xs">
                <strong>{field.name}</strong>: {field.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <div className="font-mono text-xs uppercase">{otherDetailsLabel}</div>
          <p className="text-sm text-contrast-400"> There are no other details available.</p>
        </div>
      )}
    </div>
  );
}

export function CompareCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex w-full animate-pulse flex-col divide-y divide-contrast-100 @container',
        className,
      )}
    >
      <div className="mb-2 space-y-4 pb-4">
        <ProductCardSkeleton />
        <div className="h-14 w-full rounded-full bg-contrast-100" />
      </div>

      <div className="space-y-4 py-4">
        <div className="h-[1lh] rounded-md bg-contrast-100 font-mono text-xs uppercase" />
        <div className="h-5 w-12 rounded-md bg-contrast-100" />
      </div>

      <div className="space-y-4 py-4">
        <div className="h-[1lh] rounded-md bg-contrast-100 font-mono text-xs" />
        <div className="h-[1lh] rounded-md bg-contrast-100 text-sm" />
      </div>
    </div>
  );
}
