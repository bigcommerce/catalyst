import {
  Checkbox,
  Image,
  Link,
  List,
  Number,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import { ReactRuntime } from '@makeswift/runtime/react';

import { ProductCards } from './ProductCards';

ReactRuntime.registerComponent(ProductCards, {
  type: 'product-cards',
  label: 'Product Cards',
  props: {
    className: Style(),
    cards: List({
      label: 'Product cards',
      type: Shape({
        type: {
          link: Link({ label: 'Product link' }),
          imageSrc: Image({ label: 'Image', format: Image.Format.WithDimensions }),
          imageAlt: TextInput({
            label: 'Alt text',
            defaultValue: 'Image',
            selectAll: true,
          }),
          hasBadge: Checkbox({ label: 'Show badge', defaultValue: false }),
          badgeText: TextInput({
            label: 'Badge text',
            defaultValue: 'New',
            selectAll: true,
          }),
          heading: TextInput({
            label: 'Product heading',
            defaultValue: 'T-shirts',
            selectAll: true,
          }),
          name: TextInput({
            label: 'Product name',
            defaultValue: 'Product name',
            selectAll: true,
          }),
          price: Number({
            label: 'Price',
            defaultValue: 19,
            selectAll: true,
          }),
          originalPrice: Number({
            label: 'Original price',
            selectAll: true,
          }),
        },
      }),
      getItemLabel(card) {
        return card?.name ?? 'Product name';
      },
    }),
  },
});
