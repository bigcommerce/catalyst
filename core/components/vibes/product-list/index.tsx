import { clsx } from 'clsx';

import { Product, ProductCard, ProductCardSkeleton } from '../product-card';

interface Props {
  products: Product[];
  compareProducts?: Product[];
  setCompareProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  className?: string;
}

export const ProductsList = function ProductsList({
  products,
  compareProducts,
  setCompareProducts,
  className = '',
}: Props) {
  return (
    <div className={clsx('w-full bg-background pt-0.5 @container', className)}>
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-5 gap-y-10 px-3 @md:grid-cols-2 @xl:gap-y-10 @xl:px-6 @4xl:grid-cols-3 @5xl:px-20">
        {products.length > 0
          ? products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                compareProducts={compareProducts}
                setCompareProducts={setCompareProducts}
              />
            ))
          : Array.from({ length: 5 }).map((_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    </div>
  );
};
