import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  CardProduct,
  ProductCard,
  ProductCardSkeleton,
} from '@/vibes/soul/primitives/product-card';

import { CompareDrawer } from './compare-drawer';

export type ListProduct = CardProduct;

interface Props {
  products: Streamable<ListProduct[]>;
  compareProducts?: Streamable<ListProduct[] | null>;
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showCompare?: boolean;
  compareAction?: React.ComponentProps<'form'>['action'];
  compareLabel?: string;
  compareParamName?: string;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function ProductsList({
  products: streamableProducts,
  className,
  colorScheme,
  aspectRatio,
  showCompare,
  compareAction,
  compareProducts: streamableCompareProducts,
  compareLabel,
  compareParamName,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount = 6,
}: Props) {
  return (
    <>
      <Stream
        fallback={<ProductsListSkeleton pending placeholderCount={placeholderCount} />}
        value={streamableProducts}
      >
        {(products) => {
          if (products.length === 0) {
            return (
              <ProductsListEmptyState
                emptyStateSubtitle={emptyStateSubtitle}
                emptyStateTitle={emptyStateTitle}
                placeholderCount={placeholderCount}
              />
            );
          }

          return (
            <div className={clsx('w-full @container', className)}>
              <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard
                    aspectRatio={aspectRatio}
                    colorScheme={colorScheme}
                    compareLabel={compareLabel}
                    compareParamName={compareParamName}
                    key={product.id}
                    product={product}
                    showCompare={showCompare}
                  />
                ))}
              </div>
            </div>
          );
        }}
      </Stream>
      <Stream value={streamableCompareProducts}>
        {(compareProducts) =>
          compareProducts && (
            <CompareDrawer
              action={compareAction}
              items={compareProducts}
              paramName={compareParamName}
              submitLabel={compareLabel}
            />
          )
        }
      </Stream>
    </>
  );
}

export function ProductsListSkeleton({
  className,
  placeholderCount = 6,
  pending = false,
}: {
  className?: string;
  placeholderCount?: number;
  pending?: boolean;
}) {
  return (
    <div className={clsx('w-full @container', className)} data-pending={pending ? '' : undefined}>
      <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ProductsListEmptyState({
  className,
  placeholderCount = 6,
  emptyStateTitle,
  emptyStateSubtitle,
}: {
  className?: string;
  placeholderCount?: number;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
}) {
  return (
    <div className={clsx('relative w-full @container', className)}>
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
          <h3 className="@4x:leading-none font-heading text-2xl leading-tight text-foreground @4xl:text-4xl">
            {emptyStateTitle}
          </h3>
          <p className="text-sm text-contrast-500 @4xl:text-lg">{emptyStateSubtitle}</p>
        </div>
      </div>
    </div>
  );
}
