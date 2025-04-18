import { clsx } from 'clsx';

import { ButtonLink } from '@/ui/primitives/button-link';
import { Product, ProductCard, ProductCardSkeleton } from '@/ui/primitives/product-card';
import { Rating } from '@/ui/primitives/rating';
import * as Skeleton from '@/ui/primitives/skeleton';

import { AddToCartForm, CompareAddToCartAction } from './add-to-cart-form';

export interface CompareCardWithId extends Product {
  description?: string | React.ReactNode;
  customFields?: Array<{ name: string; value: string }>;
  hasVariants?: boolean;
  disabled?: boolean;
  isPreorder?: boolean;
}

export interface CompareCardProps {
  className?: string;
  product: CompareCardWithId;
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
        '@container w-full max-w-md divide-y divide-[var(--compare-card-divider,hsl(var(--contrast-100)))] font-[family-name:var(--compare-card-font-family-primary,var(--font-family-body))] font-normal',
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
          <div className="text-sm text-[var(--compare-card-description,hsl(var(--contrast-400)))]">
            {product.description}
          </div>
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
          {product.customFields.map((field, index) => (
            <div key={index}>
              <p className="text-xs font-normal text-[var(--compare-card-field,hsl(var(--foreground)))]">
                <strong>{field.name}</strong>: {field.value}
              </p>
            </div>
          ))}
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
        <Skeleton.Text characterCount={10} className="rounded-sm" />
        <Skeleton.Box className="h-6 w-32 rounded-sm" />
      </div>
      <div className="space-y-4 py-4 text-xs">
        <Skeleton.Text characterCount={12} className="rounded-sm" />
        <div className="text-sm">
          <Skeleton.Text characterCount="full" className="rounded-sm" />
          <Skeleton.Text characterCount={45} className="rounded-sm" />
          <Skeleton.Text characterCount={40} className="rounded-sm" />
        </div>
      </div>
    </div>
  );
}
