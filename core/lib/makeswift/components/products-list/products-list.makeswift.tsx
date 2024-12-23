'use client';

import {
  Combobox,
  List,
  Number,
  Select,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import { ComponentPropsWithoutRef } from 'react';

import { ProductsList, ProductsListSkeleton } from '@/vibes/soul/primitives/products-list';
import { runtime } from '~/lib/makeswift/runtime';

import { searchProducts } from '../../utils/search-products';
import { useProducts } from '../../utils/use-products';

type MSProductsListProps = Omit<ComponentPropsWithoutRef<typeof ProductsList>, 'products'> & {
  className: string;
  collection: 'none' | 'best-selling' | 'newest' | 'featured';
  limit: number;
  additionalProducts: Array<{
    entityId?: string;
  }>;
};

runtime.registerComponent(
  function MSProductsList({
    className,
    collection,
    limit,
    additionalProducts,
    ...props
  }: MSProductsListProps) {
    const additionalProductIds = additionalProducts.map(({ entityId }) => entityId ?? '');
    const { products, isLoading } = useProducts({
      collection,
      collectionLimit: limit,
      additionalProductIds,
    });

    if (isLoading) {
      return <ProductsListSkeleton className={className} />;
    }

    if (products == null || products.length === 0) {
      return <ProductsListSkeleton className={className} />;
    }

    return <ProductsList {...props} className={className} products={products} />;
  },
  {
    type: 'primitive-products-list',
    label: 'Catalog / Products List',
    icon: 'gallery',
    props: {
      className: Style(),
      collection: Select({
        label: 'Product collection',
        options: [
          { value: 'none', label: 'None (static only)' },
          { value: 'best-selling', label: 'Best selling' },
          { value: 'newest', label: 'Newest' },
          { value: 'featured', label: 'Featured' },
        ],
        defaultValue: 'best-selling',
      }),
      limit: Number({ label: 'Max collection items', defaultValue: 12 }),
      additionalProducts: List({
        label: 'Additional products',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Product title' }),
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
          },
        }),
        getItemLabel(product) {
          return product?.title || 'Product Title';
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
        label: 'Text Color Scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
    },
  },
);
