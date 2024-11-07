import {
  Checkbox,
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

import { runtime } from '~/lib/makeswift/runtime';

import { Price } from '../price-label';

import { ProductsList } from '.';

type Product = {
  title?: string;
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
  subtitle?: string;
  badge?: string;
  type: 'single' | 'range' | 'sale';
  priceOne?: number;
  priceTwo?: number;
};

type MSProductsListProps = {
  className: string;
  products: Product[];
  showCompare: boolean;
  compareLabel: string;
  compareParamName: string;
};

runtime.registerComponent(
  function MSProductsList({ className, products, ...props }: MSProductsListProps) {
    if (products.length < 1) {
      return (
        <div className={clsx(className, 'p-4 text-center text-lg text-gray-400')}>Add products</div>
      );
    }

    return (
      <ProductsList
        {...props}
        className={className}
        products={products.map(
          ({ title, link, imageSrc, imageAlt, subtitle, badge, priceOne, priceTwo, type }) => {
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
          },
        )}
      />
    );
  },
  {
    type: 'primitive-products-list',
    label: 'Primitives / Products List',
    icon: 'gallery',
    props: {
      className: Style(),
      showCompare: Checkbox({ label: 'Show Compare', defaultValue: false }),
      compareLabel: TextInput({ label: 'Compare Label', defaultValue: 'Compare' }),
      compareParamName: TextInput({ label: 'Compare Param Name', defaultValue: 'compare' }),
      products: List({
        label: 'Products',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Product Title' }),
            link: Link({ label: 'Link' }),
            imageSrc: Image({ label: 'Image' }),
            imageAlt: TextInput({ label: 'Image Alt', defaultValue: 'Product Image' }),
            subtitle: TextInput({ label: 'Subtitle', defaultValue: 'Product Subtitle' }),
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
