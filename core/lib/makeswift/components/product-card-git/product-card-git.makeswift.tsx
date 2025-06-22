'use client';

import {
  Checkbox,
  Combobox,
  Group,
  List,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';
import { ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';
import { ProductCard } from '~/vibes/soul/primitives/product-card-git';

import { searchProducts } from '../../utils/search-products';
import { useProductsByIds } from '../../utils/fetch-products';

interface Props {
  className?: string;
  additionalProducts: ProductInterface[];
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
  aspectRatio?: '1:1' | '5:6' | '3:4';
  showReviews?: boolean;
}

interface ProductInterface {
  entityId?: string;
  badge: { show: boolean; text: string; theme: string; shape: string; location: string };
}

function MakeswiftProductCardGIT({
  className,
  additionalProducts,
  itemsPerRowDesktop,
  itemsPerRowSuperDesktop,
  itemsPerRowTablet,
  itemsPerRowMobile,
  aspectRatio,
  showReviews,
  ...props
}: Props) {
  const additionalProductIds = additionalProducts.map(({ entityId }) => entityId ?? '');

  if (additionalProductIds.length === 0) {
    return (
      <div className={className}>
        <div className="my-5 text-center text-lg text-gray-500">
          <p>Please Start Adding Products</p>
        </div>
      </div>
    );
  }

  const { products, isLoading } = useProductsByIds({
    productIds: additionalProductIds,
  });

  if (isLoading) {
    return <ProductCardSkeleton className={className} />;
  }

  if (products == null || products.length === 0) {
    return <ProductCardSkeleton className={className} />;
  }

  return (
    <div className={className}>
      <div
        className={`grid grid-cols-${itemsPerRowMobile} gap-4 sm:grid-cols-${itemsPerRowMobile} md:grid-cols-${itemsPerRowTablet} lg:grid-cols-${itemsPerRowDesktop} xl:grid-cols-${itemsPerRowSuperDesktop}`}
      >
        {products.map(async (product, index) => {
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

          const customProductSettings = additionalProducts[index] || {
            badge: {
              text: '',
              theme: '',
              shape: '',
              location: '',
              show: false,
            },
          };

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
              badge={customProductSettings?.badge}
              aspectRatio={aspectRatio}
              showReviews={showReviews}
              href={product.href}
              id={product.id}
              {...props}
            />
          );
        })}
      </div>
    </div>
  );
}

runtime.registerComponent(MakeswiftProductCardGIT, {
  type: 'catalog-product-cards-git',
  label: 'GIT / Product Cards (GIT)',
  props: {
    className: Style(),
    additionalProducts: List({
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
      getItemLabel(product) {
        return 'Product';
      },
    }),
    showReviews: Checkbox({
      label: 'Show reviews',
      defaultValue: true,
    }),
    aspectRatio: Select({
      label: 'Product Image aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '1:1',
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
