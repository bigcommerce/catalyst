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

import { searchProducts } from '../../utils/search-products';
import { useProductsByIds } from '../../utils/fetch-products';
import { Price } from '@/vibes/soul/primitives/price-label';
import clsx from 'clsx';
import { FeaturedProductCard } from '@/vibes/soul/primitives/featured-product-card-git';

interface Props {
  className?: string;
  additionalProducts: ProductInterface[];
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
  aspectRatio?: '1:1' | '5:6' | '3:4';
}

interface ProductInterface {
  entityId?: string;
}

function MakeswiftFeaturedProductsGridGIT({
  className,
  additionalProducts,
  itemsPerRowDesktop,
  itemsPerRowSuperDesktop,
  itemsPerRowTablet,
  itemsPerRowMobile,
  aspectRatio,
  ...props
}: Props) {
  const additionalProductIds = additionalProducts.map(({ entityId }) => entityId ?? '');

  if (additionalProductIds.length === 0) {
    return (
      <div className={className}>
        <div className="my-5 py-10 text-center text-lg text-gray-500">
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
    <div
      className={clsx(
        'grid gap-5',
        `grid-cols-${itemsPerRowMobile}`, // mobile: 2 columns
        `sm:grid-cols-${itemsPerRowTablet}`, // tablet: 4 columns
        `lg:grid-cols-${itemsPerRowDesktop}`, // desktop: 6 columns
        `xl:grid-cols-${itemsPerRowSuperDesktop}`, // super desktop: 8 columns
        className,
      )}
    >
      {products.map(async (product, index) => {
        const { price, salePrice } = handlePrice(product.price);

        return (
          <FeaturedProductCard
            key={product.id}
            className={className}
            image={product.image}
            name={product.title}
            // @ts-ignore
            rating={product.rating as number}
            // @ts-ignore
            reviewCount={product.reviewCount as number}
            price={price}
            salePrice={salePrice}
            aspectRatio={aspectRatio}
            href={product.href}
            id={product.id}
            {...props}
          />
        );
      })}
    </div>
  );
}

const handlePrice = (productPrice: Price | undefined) => {
  let price;
  let salePrice: string | undefined = undefined;
  if (!productPrice) {
    price = '0';
  } else if (typeof productPrice === 'string') {
    price = productPrice;
  } else if (
    typeof productPrice === 'object' &&
    productPrice !== null &&
    'minValue' in productPrice
  ) {
    price = `${productPrice.minValue} - ${productPrice.maxValue}`;
  } else if (
    typeof productPrice === 'object' &&
    productPrice !== null &&
    'previousValue' in productPrice
  ) {
    price = productPrice.previousValue;
    salePrice = productPrice.currentValue;
  }

  return {
    price,
    salePrice: salePrice ? salePrice.toString() : undefined,
  };
};

runtime.registerComponent(MakeswiftFeaturedProductsGridGIT, {
  type: 'catalog-product-featured-git',
  label: 'GIT / Featured Products (GIT)',
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
        },
      }),
      getItemLabel(product) {
        return 'Product';
      },
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
      defaultValue: '8',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
      ],
    }),
    itemsPerRowDesktop: Select({
      label: 'Items Per Row (Desktop)',
      defaultValue: '8',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
      ],
    }),
    itemsPerRowTablet: Select({
      label: 'Items Per Row (Tablet)',
      defaultValue: '4',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
      ],
    }),
    itemsPerRowMobile: Select({
      label: 'Items Per Row (Mobile)',
      defaultValue: '2',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
      ],
    }),
  },
});
