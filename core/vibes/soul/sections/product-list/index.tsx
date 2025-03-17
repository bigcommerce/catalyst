import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { CompareDrawer, CompareDrawerProvider } from '@/vibes/soul/primitives/compare-drawer';
import {
  ProductCard,
  ProductCardSkeleton,
  ProductCardWithId,
} from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

export type ListProduct = ProductCardWithId;

interface ProductListProps {
  products: Streamable<ListProduct[]>;
  compareProducts?: Streamable<ListProduct[]>;
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showCompare?: Streamable<boolean>;
  compareHref?: string;
  compareLabel?: Streamable<string>;
  compareParamName?: string;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  placeholderCount?: number;
  removeLabel?: Streamable<string>;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-list-light-empty-title: hsl(var(--foreground));
 *   --product-list-light-empty-subtitle: hsl(var(--contrast-500));
 *   --product-list-dark-empty-title: hsl(var(--background));
 *   --product-list-dark-empty-subtitle: hsl(var(--contrast-100));
 *   --product-list-empty-state-title-font-family: var(--font-family-heading);
 *   --product-list-empty-state-subtitle-font-family: var(--font-family-body);
 * }
 * ```
 */
export function ProductList({
  products: streamableProducts,
  className,
  colorScheme = 'light',
  aspectRatio = '5:6',
  showCompare: streamableShowCompare = true,
  compareHref,
  compareProducts: streamableCompareProducts = [],
  compareLabel: streamableCompareLabel = 'Compare',
  compareParamName = 'compare',
  emptyStateTitle = 'No products found',
  emptyStateSubtitle = 'Try browsing our complete catalog of products.',
  placeholderCount = 8,
  removeLabel: streamableRemoveLabel,
}: ProductListProps) {
  return (
    <Stream
      fallback={<ProductListSkeleton placeholderCount={placeholderCount} />}
      value={Streamable.all([
        streamableProducts,
        streamableCompareLabel,
        streamableShowCompare,
        streamableCompareProducts,
        streamableRemoveLabel,
      ])}
    >
      {([products, compareLabel, showCompare, compareProducts, removeLabel]) => {
        if (products.length === 0) {
          return (
            <ProductListEmptyState
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <CompareDrawerProvider items={compareProducts}>
            <div className={clsx('w-full @container', className)}>
              <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard
                    aspectRatio={aspectRatio}
                    colorScheme={colorScheme}
                    compareLabel={compareLabel}
                    compareParamName={compareParamName}
                    imageSizes="(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw"
                    key={product.id}
                    product={product}
                    showCompare={showCompare}
                  />
                ))}
              </div>
            </div>
            {showCompare && compareProducts.length > 0 && (
              <CompareDrawer
                href={compareHref}
                paramName={compareParamName}
                removeLabel={removeLabel}
                submitLabel={compareLabel}
              />
            )}
          </CompareDrawerProvider>
        );
      }}
    </Stream>
  );
}

export function ProductListSkeleton({
  className,
  placeholderCount = 8,
}: Pick<ProductListProps, 'className' | 'placeholderCount'>) {
  return (
    <Skeleton.Root
      className={clsx('group-has-[[data-pending]]/product-list:animate-pulse', className)}
      pending
    >
      <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

export function ProductListEmptyState({
  className,
  placeholderCount = 8,
  emptyStateTitle,
  emptyStateSubtitle,
}: Pick<
  ProductListProps,
  'className' | 'placeholderCount' | 'emptyStateTitle' | 'emptyStateSubtitle'
>) {
  return (
    <Skeleton.Root className={clsx('relative', className)}>
      <div
        className={clsx(
          'mx-auto grid grid-cols-1 gap-x-4 gap-y-6 [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5',
        )}
      >
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <h3 className="font-[family-name:var(--product-list-empty-state-title-font-family,var(--font-family-heading))] text-2xl leading-tight text-[var(--product-list-empty-state-title,hsl(var(--foreground)))] @4xl:text-4xl @4xl:leading-none">
            {emptyStateTitle}
          </h3>
          <p className="font-[family-name:var(--product-list-empty-state-subtitle-font-family,var(--font-family-body))] text-sm text-[var(--product-list-empty-state-subtitle,hsl(var(--contrast-500)))] @4xl:text-lg">
            {emptyStateSubtitle}
          </p>
        </div>
      </div>
    </Skeleton.Root>
  );
}
