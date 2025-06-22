'use client';

import {
  Checkbox,
  Combobox,
  Group,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import useSWR from 'swr';

import { runtime } from '~/lib/makeswift/runtime';
import {
  BcProductSchema,
  useBcProductToVibesProduct,
} from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';
import { ProductCard } from '~/vibes/soul/primitives/product-card-git';

import { searchProducts } from '../../utils/search-products';

interface Props {
  className?: string;
  products: ProductInterface[];
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
}

interface ProductInterface {
  entityId?: string;
  aspectRatio?: '1:1' | '5:6' | '3:4';
  badge: { show: boolean; text: string; theme: string; shape: string; location: string };
  showReviews?: boolean;
}

function MakeswiftProductCardGIT({
  className,
  products,
  itemsPerRowDesktop,
  itemsPerRowSuperDesktop,
  itemsPerRowTablet,
  itemsPerRowMobile,
  ...props
}: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-${itemsPerRowMobile} md:grid-cols-${itemsPerRowTablet} lg:grid-cols-${itemsPerRowDesktop} xl:grid-cols-${itemsPerRowSuperDesktop} ${className}`}
    >
      {products.map(async (item) => {
        const { badge, aspectRatio, entityId, showReviews } = item;

        const { data, isLoading } = useSWR(
          entityId ? `/api/products/${entityId}` : null,
          async (url) =>
            fetch(url)
              .then((r) => r.json())
              .then(BcProductSchema.parse),
        );

        if (entityId == null || isLoading || data == null) {
          return <ProductCardSkeleton className={className} />;
        }

        const product = bcProductToVibesProduct(data);

        let price;
        let salePrice: string | undefined = undefined;
        if (!product.price) {
          price = '0';
        } else if (typeof product.price === 'string') {
          price = product.price;
        } else if (
          typeof product.price === 'object' &&
          product.price !== null &&
          'minValue' in product.price
        ) {
          price = `${product.price.minValue} - ${product.price.maxValue}`;
        } else if (
          typeof product.price === 'object' &&
          product.price !== null &&
          'previousValue' in product.price
        ) {
          price = product.price.previousValue;
          salePrice = product.price.currentValue;
        }

        return (
          <ProductCard
            key={product.id}
            className={className}
            image={product.image}
            name={product.title}
            rating={product.rating || 0}
            reviewCount={product.reviewCount || 0}
            price={price}
            salePrice={salePrice}
            badge={badge}
            aspectRatio={aspectRatio}
            showReviews={showReviews}
            href={product.href}
            id={product.id}
            {...props}
          />
        );
      })}
    </div>
  );
}

runtime.registerComponent(MakeswiftProductCardGIT, {
  type: 'catalog-product-card-git',
  label: 'GIT / Product Card (GIT)',
  props: {
    className: Style(),
    products: List({
      label: 'Products',
      type: Group({
        label: 'Product',
        props: {
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
            label: 'Image aspect ratio',
            options: [
              { value: '1:1', label: 'Square' },
              { value: '5:6', label: '5:6' },
              { value: '3:4', label: '3:4' },
            ],
            defaultValue: '5:6',
          }),
          showReviews: Checkbox({
            label: 'Show reviews',
            defaultValue: true,
          }),
          badge: Group({
            label: 'Badge',
            props: {
              show: Checkbox({ label: 'Show badge', defaultValue: true }),
              text: TextInput({ label: 'Badge text', defaultValue: 'New' }),
              shape: Select({
                label: 'Badge shape',
                options: [
                  { value: 'pill', label: 'Pill' },
                  { value: 'rounded', label: 'Rounded' },
                ],
                defaultValue: 'rounded',
              }),
              location: Select({
                label: 'Badge location',
                options: [
                  { value: 'left', label: 'Top Left' },
                  { value: 'right', label: 'Top Right' },
                ],
                defaultValue: 'right',
              }),
              theme: Select({
                label: 'Badge Theme',
                options: [
                  { value: 'error', label: 'Error' },
                  { value: 'info', label: 'Info' },
                  { value: 'primary', label: 'Primary' },
                  { value: 'success', label: 'Success' },
                  { value: 'warning', label: 'Warning' },
                ],
                defaultValue: 'primary',
              }),
            },
          }),
        },
      }),
    }),
    itemsPerRowSuperDesktop: Select({
      label: 'Items Per Row (Super Desktop)',
      defaultValue: '4',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    }),
    itemsPerRowDesktop: Select({
      label: 'Items Per Row (Desktop)',
      defaultValue: '4',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    }),
    itemsPerRowTablet: Select({
      label: 'Items Per Row (Tablet)',
      defaultValue: '2',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    }),
    itemsPerRowMobile: Select({
      label: 'Items Per Row (Mobile)',
      defaultValue: '1',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    }),
  },
});
