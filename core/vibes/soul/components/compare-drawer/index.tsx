import { ProductChip } from '@/vibes/soul/components/compare-drawer/product-chip';
import { ComparePanel } from '@/vibes/soul/components/compare-panel';
import { Product } from '@/vibes/soul/components/product-card';

interface Props {
  compareProducts: Product[];
  setCompareProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const CompareDrawer = function CompareDrawer({
  compareProducts,
  setCompareProducts,
}: Props) {
  return (
    compareProducts.length > 0 && (
      <div className="sticky bottom-0 w-full border-y bg-background @container">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-end justify-end gap-5 px-3 py-5 @xl:px-6 @5xl:px-20">
          {compareProducts.map((product) => (
            <ProductChip
              key={product.id}
              product={product}
              setCompareProducts={setCompareProducts}
            />
          ))}
          {/* Compare Button & Panel */}
          <ComparePanel compareProducts={compareProducts} />
        </div>
      </div>
    )
  );
};
