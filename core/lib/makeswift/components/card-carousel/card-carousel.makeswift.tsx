import {
  Checkbox,
  Image,
  Link,
  List,
  Select,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { CardCarousel, CardCarouselProps } from '@/vibes/soul/primitives/card-carousel';
import { runtime } from '~/lib/makeswift/runtime';

interface Card {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

type MSCardCarouselProps = Omit<CardCarouselProps, 'cards'> & {
  cards: Card[];
};

runtime.registerComponent(
  function MSCardCarousel({ cards, textColorScheme, ...props }: MSCardCarouselProps) {
    return (
      <CardCarousel
        {...props}
        cards={cards.map(({ title, imageSrc, imageAlt, link }, index) => {
          return {
            id: title ?? index.toString(),
            title: title ?? '',
            image: imageSrc ? { src: imageSrc, alt: imageAlt ?? '' } : undefined,
            href: link?.href ?? '',
          };
        })}
        carouselColorScheme={textColorScheme}
      />
    );
  },
  {
    type: 'primitive-card-carousel',
    label: 'Basic / Card Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
      cards: List({
        label: 'Cards',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Card title' }),
            imageSrc: Image({ label: 'Image' }),
            imageAlt: TextInput({ label: 'Image Alt', defaultValue: 'Card image' }),
            link: Link({ label: 'Link' }),
          },
        }),
        getItemLabel(card) {
          return card?.title || 'Card';
        },
      }),
      aspectRatio: Select({
        label: 'Aspect Ratio',
        options: [
          { value: '5:6', label: '5:6' },
          { value: '3:4', label: '3:4' },
          { value: '1:1', label: 'Square' },
        ],
        defaultValue: '5:6',
      }),
      textColorScheme: Select({
        label: 'Text Color Scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
      iconColorScheme: Select({
        label: 'Icon Color Scheme',
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
