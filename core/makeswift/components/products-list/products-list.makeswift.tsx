'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  Checkbox,
  Combobox,
  Image,
  Link,
  List,
  Number,
  Select,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import { useFormatter } from 'next-intl';
import useSWR from 'swr';

import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductsList, ProductsListSkeleton } from '@/vibes/soul/primitives/products-list';
import { SearchProductsResponse } from '~/app/api/products/route';
import { GetProductsResponse } from '~/client/queries/get-products';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { runtime } from '~/lib/makeswift/runtime';

interface Product {
  entityId?: string;
  title?: string;
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
  subtitle?: string;
  badge?: string;
  type: 'single' | 'range' | 'sale';
  priceOne?: number;
  priceTwo?: number;
}

interface MSProductsListProps {
  className: string;
  collection: 'none' | 'bestSelling' | 'newest' | 'featured';
  products: Product[];
  showCompare: boolean;
  compareLabel: string;
}

const fetcher = async (url: string): Promise<{ products: GetProductsResponse }> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await response.json();
};

runtime.registerComponent(
  function MSProductsList({ className, collection, products, ...props }: MSProductsListProps) {
    const format = useFormatter();

    const productIds = products.map(({ entityId }) => entityId ?? '');

    const { data, isLoading } = useSWR([collection, productIds], async () => {
      const apiResults =
        collection !== 'none'
          ? await fetcher(`/api/products/group/${collection}`)
          : { products: [] };

      const searchParams = new URLSearchParams();

      searchParams.append('ids', productIds.join(','));

      const additionalProducts = await fetcher(`/api/products/ids?${searchParams.toString()}`);

      return [...apiResults.products, ...additionalProducts.products];
    });

    if (isLoading) {
      return <ProductsListSkeleton className={className} />;
    }

    if (products.length === 0 && data && data.length === 0) {
      return <ProductsListSkeleton className={className} message="No products found" />;
    }

    const listedProducts = products
      .filter((p) => !p.entityId)
      .map(({ title, link, imageSrc, imageAlt, subtitle, badge, priceOne, priceTwo, type }) => {
        let price: Price;

        switch (type) {
          case 'single':
            price = `$${priceOne?.toString() ?? ''}`;
            break;

          case 'range':
            price = {
              minValue: `$${priceOne?.toString() ?? ''}`,
              maxValue: `$${priceTwo?.toString() ?? ''}`,
              type,
            };
            break;

          case 'sale':
            price = {
              previousValue: `$${priceOne?.toString() ?? ''}`,
              currentValue: `$${priceTwo?.toString() ?? ''}`,
              type,
            };
            break;

          default:
            price = '0';
        }

        return {
          id: title ?? '',
          title: title ?? '',
          href: link?.href ?? '',
          image: imageSrc ? { src: imageSrc, alt: imageAlt } : undefined,
          price,
          subtitle: subtitle ?? '',
          badge: badge ?? '',
          type,
        };
      });

    const apiProducts = data
      ? data.map(({ entityId, name, prices, defaultImage, path, categories }) => {
          return {
            id: entityId.toString(),
            title: name,
            href: path,
            image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
            subtitle: removeEdgesAndNodes(categories)
              .map((category) => category.name)
              .join(', '),
            price: pricesTransformer(prices, format),
          };
        })
      : [];

    const allProducts = [...apiProducts, ...listedProducts];

    return <ProductsList {...props} className={className} products={allProducts} />;
  },
  {
    type: 'primitive-products-list',
    label: 'Catalog / Products List',
    icon: 'gallery',
    props: {
      className: Style(),
      showCompare: Checkbox({ label: 'Show compare', defaultValue: false }),
      compareLabel: TextInput({ label: 'Compare label', defaultValue: 'Compare' }),
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
      products: List({
        label: 'Additional products',
        type: Shape({
          type: {
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
            title: TextInput({ label: 'Title', defaultValue: 'Product title' }),
            link: Link({ label: 'Link' }),
            imageSrc: Image({ label: 'Image' }),
            imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Product image' }),
            subtitle: TextInput({ label: 'Subtitle', defaultValue: 'Product subtitle' }),
            badge: TextInput({ label: 'Badge', defaultValue: 'New' }),

            type: Select({
              options: [
                { value: 'single', label: 'Single' },
                { value: 'range', label: 'Range' },
                { value: 'sale', label: 'Sale' },
              ],
              defaultValue: 'single',
            }),
            priceOne: Number({ label: 'Price One', defaultValue: 100 }),
            priceTwo: Number({ label: 'Price Two', defaultValue: 200 }),
          },
        }),
        getItemLabel(product) {
          return product?.title || 'Product Title';
        },
      }),
    },
  },
);
