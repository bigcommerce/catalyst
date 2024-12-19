'use client';

import {
  Checkbox,
  Combobox,
  List,
  Select,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import { ComponentPropsWithoutRef } from 'react';
import useSWR from 'swr';

import {
  ProductsCarousel,
  ProductsCarouselSkeleton,
} from '@/vibes/soul/primitives/products-carousel';
import { SearchProductsResponse } from '~/app/api/products/route';
import { GetProductsResponse } from '~/client/queries/get-products';
import { runtime } from '~/lib/makeswift/runtime';

import { useBcProductToVibesProduct } from '../../utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

type MSProductsCarouselProps = Omit<
  ComponentPropsWithoutRef<typeof ProductsCarousel>,
  'products'
> & {
  className: string;
  collection: 'none' | 'bestSelling' | 'newest' | 'featured';
  additionalProducts: Array<{
    entityId?: string;
  }>;
};

const fetcher = async (url: string): Promise<{ products: GetProductsResponse }> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await response.json();
};

runtime.registerComponent(
  function MSProductsCarousel({
    className,
    collection,
    additionalProducts,
    ...props
  }: MSProductsCarouselProps) {
    const bcProductToVibesProduct = useBcProductToVibesProduct();

    const additionalProductIds = additionalProducts.map(({ entityId }) => entityId ?? '');

    const { data, isLoading } = useSWR([collection, additionalProductIds], async () => {
      const collectionResults =
        collection !== 'none'
          ? await fetcher(`/api/products/group/${collection}`)
          : { products: [] };

      const searchParams = new URLSearchParams();

      searchParams.append('ids', additionalProductIds.join(','));

      const additionalProductsResult = await fetcher(
        `/api/products/ids?${searchParams.toString()}`,
      );

      return [...collectionResults.products, ...additionalProductsResult.products];
    });

    if (isLoading) {
      return <ProductsCarouselSkeleton className={className} />;
    }

    if (data == null || data.length === 0) {
      return <ProductsCarouselSkeleton className={className} />;
    }

    const products = data.map(bcProductToVibesProduct);

    return <ProductsCarousel {...props} className={className} products={products} />;
  },
  {
    type: 'primitive-products-carousel',
    label: 'Catalog / Products Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
      collection: Select({
        label: 'Product collection',
        options: [
          { value: 'none', label: 'None (static only)' },
          { value: 'bestSelling', label: 'Best selling' },
          { value: 'newest', label: 'Newest' },
          { value: 'featured', label: 'Featured' },
        ],
        defaultValue: 'bestSelling',
      }),
      additionalProducts: List({
        label: 'Additional products',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Product title' }),
            entityId: Combobox({
              label: 'Product',
              async getOptions(query) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const res: SearchProductsResponse = await fetch(
                  `/api/products?search=${query}`,
                ).then((r) => r.json());

                if (res.data == null) return [];

                return res.data.products.map((product) => ({
                  id: product.entityId.toString(),
                  label: product.name,
                  value: product.entityId.toString(),
                }));
              },
            }),
          },
        }),
        getItemLabel(product) {
          return product?.title || 'Product';
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
      showScrollbar: Checkbox({
        label: 'Show Scrollbar',
        defaultValue: true,
      }),
      showButtons: Checkbox({
        label: 'Show Buttons',
        defaultValue: true,
      }),
    },
  },
);
