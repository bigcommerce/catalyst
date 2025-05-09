import { clsx } from 'clsx';
import { Fragment } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  type Product,
  ProductCard,
  ProductCardSkeleton,
} from '@/vibes/soul/primitives/product-card';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Reveal } from '@/vibes/soul/primitives/reveal';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

import { AddToCartForm, CompareAddToCartAction } from './add-to-cart-form';

export interface CompareProduct extends Product {
  description?: string | React.ReactNode;
  customFields?: Array<{ name: string; value: string }>;
  hasVariants?: boolean;
  disabled?: boolean;
  isPreorder?: boolean;
}

export interface CompareCardProps {
  className?: string;
  product: CompareProduct;
  addToCartLabel?: string;
  descriptionLabel?: string;
  noDescriptionLabel?: string;
  ratingLabel?: string;
  noRatingsLabel?: string;
  otherDetailsLabel?: string;
  noOtherDetailsLabel?: string;
  viewOptionsLabel?: string;
  preorderLabel?: string;
  addToCartAction?: CompareAddToCartAction;
  imageSizes?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --compare-card-divider: hsl(var(--contrast-100));
 *   --compare-card-label: hsl(var(--foreground));
 *   --compare-card-description: hsl(var(--contrast-400));
 *   --compare-card-field: hsl(var(--foreground));
 *   --compare-card-font-family-primary: var(--font-family-body);
 *   --compare-card-font-family-secondary: var(--font-family-mono);
 * }
 * ```
 */
export function CompareCard({
  className,
  product,
  addToCartAction,
  addToCartLabel = 'Add to cart',
  descriptionLabel = 'Description',
  noDescriptionLabel = 'There is no description available.',
  ratingLabel = 'Rating',
  noRatingsLabel = 'There are no reviews.',
  otherDetailsLabel = 'Other details',
  noOtherDetailsLabel = 'There are no other details.',
  viewOptionsLabel = 'View options',
  preorderLabel = 'Preorder',
  imageSizes,
}: CompareCardProps) {
  return (
    <div
      className={clsx(
        '@container w-full max-w-72 divide-y divide-[var(--compare-card-divider,hsl(var(--contrast-100)))] font-[family-name:var(--compare-card-font-family-primary,var(--font-family-body))] font-normal',
        className,
      )}
    >
      <div className="mb-2 space-y-4 pb-4">
        <ProductCard imageSizes={imageSizes} product={product} />
        {addToCartAction &&
          (product.hasVariants !== undefined && !product.hasVariants ? (
            <AddToCartForm
              addToCartAction={addToCartAction}
              addToCartLabel={addToCartLabel}
              disabled={product.disabled}
              isPreorder={product.isPreorder}
              preorderLabel={preorderLabel}
              productId={product.id}
            />
          ) : (
            <ButtonLink className="w-full" href={product.href} size="medium">
              {viewOptionsLabel}
            </ButtonLink>
          ))}
      </div>
      <div className="space-y-4 py-4">
        <div className="font-[family-name:var(--compare-card-font-family-secondary,var(--font-family-mono))] text-xs font-normal text-[var(--compare-card-label,hsl(var(--foreground)))] uppercase">
          {ratingLabel}
        </div>
        {product.rating != null ? (
          <Rating rating={product.rating} />
        ) : (
          <p className="text-sm text-[var(--compare-card-description,hsl(var(--contrast-400)))]">
            {noRatingsLabel}
          </p>
        )}
      </div>
      <div className="space-y-4 py-4">
        <div className="font-[family-name:var(--compare-card-font-family-secondary,var(--font-family-mono))] text-xs font-normal text-[var(--compare-card-label,hsl(var(--foreground)))] uppercase">
          {descriptionLabel}
        </div>
        {product.description != null && product.description !== '' ? (
          <Reveal>
            <div className="prose prose-sm [&>div>*:first-child]:mt-0">{product.description}</div>
          </Reveal>
        ) : (
          <p className="text-sm text-[var(--compare-card-description,hsl(var(--contrast-400)))]">
            {noDescriptionLabel}
          </p>
        )}
      </div>
      {product.customFields != null ? (
        <div className="space-y-4 py-4">
          <div className="font-[family-name:var(--compare-card-font-family-secondary,var(--font-family-mono))] text-xs font-normal text-[var(--compare-card-label,hsl(var(--foreground)))] uppercase">
            {otherDetailsLabel}
          </div>
          <Reveal>
            <dl className="grid grid-cols-2 gap-1 text-xs font-normal text-[var(--compare-card-field,hsl(var(--foreground)))]">
              {product.customFields.map((field, index) => (
                <Fragment key={index}>
                  <dt className="font-semibold">{field.name}: </dt>
                  <dd>{field.value}</dd>
                </Fragment>
              ))}
            </dl>
          </Reveal>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <div className="font-[family-name:var(--compare-card-font-family-secondary,var(--font-family-mono))] text-xs font-normal text-[var(--compare-card-label,hsl(var(--foreground)))] uppercase">
            {otherDetailsLabel}
          </div>
          <p className="text-sm text-[var(--compare-card-description,hsl(var(--contrast-400)))]">
            {noOtherDetailsLabel}
          </p>
        </div>
      )}
    </div>
  );
}

export function CompareCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        '@container w-full max-w-md divide-y divide-[var(--skeleton,hsl(var(--contrast-300)/15%))]',
        className,
      )}
    >
      <div className="mb-2 space-y-4 pb-4">
        <ProductCardSkeleton />
        <Skeleton.Box className="h-12 rounded-full" />
      </div>
      <div className="space-y-4 py-4 text-xs">
        <Skeleton.Text characterCount={10} className="rounded" />
        <Skeleton.Box className="h-6 w-32 rounded" />
      </div>
      <div className="space-y-4 py-4 text-xs">
        <Skeleton.Text characterCount={12} className="rounded" />
        <div className="text-sm">
          <Skeleton.Text characterCount="full" className="rounded" />
          <Skeleton.Text characterCount={45} className="rounded" />
          <Skeleton.Text characterCount={40} className="rounded" />
        </div>
      </div>
    </div>
  );
}
