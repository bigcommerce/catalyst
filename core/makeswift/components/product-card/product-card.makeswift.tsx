import { Checkbox, Combobox, Style } from '@makeswift/runtime/controls';
import useSWR from 'swr';

import { GetProductResponse } from '~/app/api/products/[entityId]/route';
import { SearchProductsResponse } from '~/app/api/products/route';
import { runtime } from '~/lib/makeswift/runtime';
import { useBcProductToVibesProduct } from '~/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { ProductCard, ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';

interface Props {
  entityId?: string;
  className?: string;
  showCompare?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function MakeswiftProductCard({ entityId, className, showCompare }: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading } = useSWR<GetProductResponse>(
    entityId ? `/api/products/${entityId}` : null,
    fetcher,
  );

  if (entityId == null) {
    // return <ProductCardEmpty title={t('empty')} />;
    return <ProductCardSkeleton className={className} />;
  }

  if (isLoading) {
    return <ProductCardSkeleton className={className} />;
  }

  if (data == null || error) {
    // return <ProductCardError title={t('error')} />;
    return <ProductCardSkeleton className={className} />;
  }

  const product = bcProductToVibesProduct(data);

  return <ProductCard className={className} product={product} showCompare={showCompare} />;
}

runtime.registerComponent(MakeswiftProductCard, {
  type: 'catalog-product-card',
  label: 'Catalog / Product Card',
  props: {
    className: Style(),
    entityId: Combobox({
      label: 'Product',
      async getOptions(query) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res: SearchProductsResponse = await fetch(`/api/products?search=${query}`).then((r) =>
          r.json(),
        );

        if (res.data == null) return [];

        return res.data.products.map((product) => ({
          id: product.entityId.toString(),
          label: product.name,
          value: product.entityId.toString(),
        }));
      },
    }),
    showCompare: Checkbox({ label: 'Show Compare', defaultValue: false }),
  },
});
