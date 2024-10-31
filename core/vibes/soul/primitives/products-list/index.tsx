import { Suspense, use } from 'react'

import { clsx } from 'clsx'

import { CardProduct, ProductCard, ProductCardSkeleton } from '@/vibes/soul/primitives/product-card'

import { CompareDrawer } from './compare-drawer'

export type ListProduct = CardProduct

interface Props {
  products: ListProduct[] | Promise<ListProduct[]>
  compareProducts?: ListProduct[] | Promise<ListProduct[]>
  className?: string
  showCompare?: boolean
  compareLabel?: string
  compareParamName?: string
}

function ProductsListInner({
  products,
  showCompare,
  compareLabel,
  compareParamName,
}: Omit<Props, 'className'>) {
  const resolved = products instanceof Promise ? use(products) : products

  return resolved.map(product => (
    <ProductCard
      key={product.id}
      product={product}
      showCompare={showCompare}
      compareLabel={compareLabel}
      compareParamName={compareParamName}
    />
  ))
}

export function ProductsList({
  products,
  className,
  showCompare,
  compareProducts,
  compareLabel,
  compareParamName,
}: Props) {
  return (
    <>
      <div className={clsx('w-full @container', className)}>
        <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-6 @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5">
          <Suspense
            fallback={Array.from({ length: 9 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          >
            <ProductsListInner
              products={products}
              showCompare={showCompare}
              compareLabel={compareLabel}
              compareParamName={compareParamName}
            />
          </Suspense>
        </div>
      </div>
      {compareProducts && <CompareDrawer items={compareProducts} paramName={compareParamName} />}
    </>
  )
}
