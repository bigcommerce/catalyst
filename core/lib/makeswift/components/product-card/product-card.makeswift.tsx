'use client';

import { Checkbox, Combobox, Select, Shape, Style, TextInput } from '@makeswift/runtime/controls';
import useSWR from 'swr';

import { runtime } from '~/lib/makeswift/runtime';
import {
  BcProductSchema,
  useBcProductToVibesProduct,
} from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { ProductCard, ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';

import { searchProducts } from '../../utils/search-products';

interface Props {
  className?: string;
  entityId?: string;
  aspectRatio: '1:1' | '5:6' | '3:4';
  colorScheme: 'light' | 'dark';
  badge: { show: boolean; text: string };
  showCompare?: boolean;
}

function MakeswiftProductCard({ className, entityId, badge, ...props }: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  const { data, isLoading } = useSWR(entityId ? `/api/products/${entityId}` : null, async (url) =>
    fetch(url)
      .then((r) => r.json())
      .then(BcProductSchema.parse),
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
        const products = await searchProducts(query);

        return products.map((product) => ({
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
