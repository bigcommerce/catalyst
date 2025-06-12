import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCardCarousel } from './client';

runtime.registerComponent(MSCardCarousel, {
  type: 'primitive-card-carousel',
  label: 'Basic / Card Carousel',
  icon: 'carousel',
  props: {
    className: Style(),
    cards: List({
      label: 'Cards',
      type: Group({
        label: 'Card',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Title' }),
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
      label: 'Aspect ratio',
      options: [
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
        { value: '1:1', label: 'Square' },
      ],
      defaultValue: '5:6',
    }),
    textColorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
    iconColorScheme: Select({
      label: 'Card icon color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
    showScrollbar: Checkbox({
      label: 'Show scrollbar',
      defaultValue: true,
    }),
    showButtons: Checkbox({
      label: 'Show buttons',
      defaultValue: true,
    }),
    hideOverflow: Checkbox({
      label: 'Hide overflow',
      defaultValue: true,
    }),
  },
});
