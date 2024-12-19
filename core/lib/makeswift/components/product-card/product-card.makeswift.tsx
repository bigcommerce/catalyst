'use client';

import { Checkbox, Combobox, Select, Shape, Style, TextInput } from '@makeswift/runtime/controls';
import useSWR from 'swr';

import { GetProductResponse } from '~/app/api/products/[entityId]/route';
import { SearchProductsResponse } from '~/app/api/products/route';
import { runtime } from '~/lib/makeswift/runtime';
import { useBcProductToVibesProduct } from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { ProductCard, ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';

interface Props {
  className?: string;
  entityId?: string;
  aspectRatio: '1:1' | '5:6' | '3:4';
  colorScheme: 'light' | 'dark';
  badge: { show: boolean; text: string };
  showCompare?: boolean;
}

const fetcher = async (url: string): Promise<GetProductResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await response.json();
};

function MakeswiftProductCard({ className, entityId, badge, ...props }: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  const { data, isLoading } = useSWR<GetProductResponse>(
    entityId ? `/api/products/${entityId}` : null,
    fetcher,
  );

  if (entityId == null || isLoading || data == null) {
    return <ProductCardSkeleton className={className} />;
  }

  const product = bcProductToVibesProduct(data);

  return (
    <ProductCard
      className={className}
      product={{
        ...product,
        badge: badge.show ? badge.text : undefined,
      }}
      {...props}
    />
  );
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
    aspectRatio: Select({
      label: 'Aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '5:6',
    }),
    colorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
    badge: Shape({
      type: {
        show: Checkbox({ label: 'Show badge', defaultValue: true }),
        text: TextInput({ label: 'Badge text', defaultValue: 'New' }),
      },
    }),
    showCompare: Checkbox({ label: 'Show compare', defaultValue: true }),
  },
});
