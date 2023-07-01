import { Checkbox, Image, Link, Number, Style, TextInput } from '@makeswift/runtime/controls';
import { ReactRuntime } from '@makeswift/runtime/react';

import { ProductCard } from './ProductCard';
import { runtime } from 'lib/runtime';

runtime.registerComponent(ProductCard, {
  type: 'product-card',
  label: 'Product Card',
  props: {
    className: Style(),
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
});
