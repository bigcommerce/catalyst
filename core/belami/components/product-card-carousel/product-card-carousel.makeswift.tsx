import { Image, Link, List, Shape, TextInput } from '@makeswift/runtime/controls';

import { ProductCardCarousel } from '.';
import { runtime } from '~/lib/makeswift/runtime';

interface ProductCard {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  classNames?: {
    root?: string,
    link?: string,
    figure?: string,
    image?: string,
    title?: string
  }
}

interface MSProductCardCarouselProps {
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  productCards: ProductCard[];
}

runtime.registerComponent(
  function MSProductCardCarousel({ classNames, productCards }: MSProductCardCarouselProps) {
    return (
      <ProductCardCarousel
        productCards={productCards.map(({ title, imageSrc, imageAlt, link }, index) => {
          return {
            id: title ?? index.toString(),
            title: title ?? '',
            image: imageSrc ? { src: imageSrc, alt: imageAlt ?? '' } : undefined,
            url: link?.href ?? '',
          };
        })}
        classNames={classNames}
      />
    );
  },
  {
    type: 'belami-product-card-carousel',
    label: 'Belami / Product Card Carousel',
    icon: 'carousel',
    props: {
      /*
      classNames: Shape({
        type: {
          root: TextInput({ label: 'Root class', defaultValue: '' }),
          content: TextInput({ label: 'Content class', defaultValue: '' }),
          item: TextInput({ label: 'Item class', defaultValue: '' }),
        }
      }),
      */
      productCards: List({
        label: 'Product Cards',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Product title' }),
            imageSrc: Image({ label: 'Image' }),
            imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Product image' }),
            link: Link({ label: 'Link' }),
            /*
            classNames: Shape({
              type: {
                root: TextInput({ label: 'Root class', defaultValue: '' }),
                link: TextInput({ label: 'Link class', defaultValue: '' }),
                figure: TextInput({ label: 'Figure class', defaultValue: '' }),
                image: TextInput({ label: 'Image class', defaultValue: '' }),
                title: TextInput({ label: 'Title class', defaultValue: '' })
              }
            })
            */
          },
        }),
        getItemLabel(productCard) {
          return productCard?.title || 'Product';
        },
      }),
    },
  },
);
