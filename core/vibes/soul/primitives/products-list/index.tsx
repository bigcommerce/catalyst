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
  showCompare?: boolean;
  compareAction?: React.ComponentProps<'form'>['action'];
  compareLabel?: string;
  compareParamName?: string;
}

export function ProductsList({
  products: streamableProducts,
  className,
  showCompare,
  compareAction,
  compareProducts: streamableCompareProducts,
  compareLabel,
  compareParamName,
}: Props) {
  return (
    <>
      <div className={clsx('w-full @container', className)}>
        <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5">
          <Stream
            fallback={Array.from({ length: 9 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
            value={streamableProducts}
          >
            {(products) =>
              products.map((product) => (
                <ProductCard
                  compareLabel={compareLabel}
                  compareParamName={compareParamName}
                  key={product.id}
                  product={product}
                  showCompare={showCompare}
                />
              ))
            }
          </Stream>
        </div>
      </div>
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
  message,
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div className={clsx('relative w-full @container', className)}>
      <div
        className={clsx(
          'mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5',
          message != null &&
            message !== '' &&
            '[mask-image:radial-gradient(circle,transparent,black)]',
        )}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-xl">{message}</div>
    </div>
  );
}
