import {
  Image,
  Link,
  List,
  Number,
  Select,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { Price } from '../price-label';

import { ProductsCarousel } from '.';

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

type MSProductsCarouselProps = {
  className: string;
  products: Product[];
};

runtime.registerComponent(
  function MSProductsCarousel({ className, products }: MSProductsCarouselProps) {
    return (
      <ProductsCarousel
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
    type: 'primitive-products-carousel',
    label: 'Primitives / Products Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
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
          return product?.title || 'Product';
        },
      }),
    },
  },
);
