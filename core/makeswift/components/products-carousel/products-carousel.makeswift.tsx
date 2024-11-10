'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
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
import clsx from 'clsx';
import { useFormatter } from 'next-intl';
import useSWR from 'swr';

import { CardSkeleton } from '@/vibes/soul/primitives/card';
import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductsCarousel } from '@/vibes/soul/primitives/products-carousel';
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

interface MSProductsCarouselProps {
  className: string;
  collection: 'none' | 'bestSelling' | 'newest' | 'featured';
  products: Product[];
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
  function MSProductsCarousel({
    className,
    collection,
    products,
    ...props
  }: MSProductsCarouselProps) {
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

    if (isLoading)
      return Array.from({ length: 5 }).map((_, index) => (
        <div className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4" key={index}>
          <CardSkeleton />
        </div>
      ));

    if (products.length < 1 && data && data.length < 1) {
      return (
        <div className={clsx(className, 'p-4 text-center text-lg text-gray-400')}>Add products</div>
      );
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

    return <ProductsCarousel {...props} className={className} products={allProducts} />;
  },
  {
    type: 'primitive-products-carousel',
    label: 'Primitives / Products Carousel',
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
      products: List({
        label: 'Products',
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
          return product?.title || 'Product';
        },
      }),
    },
  },
);
