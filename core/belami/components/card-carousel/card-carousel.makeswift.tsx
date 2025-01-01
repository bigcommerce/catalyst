import { Image, Link, List, Shape, TextInput } from '@makeswift/runtime/controls';

import { CardCarousel } from '.';
import { runtime } from '~/lib/makeswift/runtime';

interface Card {
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

interface MSCardCarouselProps {
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  cards: Card[];
}

runtime.registerComponent(
  function MSCardCarousel({ classNames, cards }: MSCardCarouselProps) {
    return (
      <CardCarousel
        cards={cards.map(({ title, imageSrc, imageAlt, link }, index) => {
          return {
            id: title ?? index.toString(),
            title: title ?? '',
            image: imageSrc ? { src: imageSrc, alt: imageAlt ?? '' } : undefined,
            href: link?.href ?? '',
          };
        })}
        classNames={classNames}
      />
    );
  },
  {
    type: 'primitive-card-carousel',
    label: 'Belami / Card Carousel',
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
      cards: List({
        label: 'Cards',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Card title' }),
            imageSrc: Image({ label: 'Image' }),
            imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Card image' }),
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
        getItemLabel(card) {
          return card?.title || 'Card';
        },
      }),
    },
  },
);
