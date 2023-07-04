import {
  Color,
  Image,
  Link,
  List,
  Number,
  Shape,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { ProductCarousel } from './ProductCarousel';
import { runtime } from 'lib/runtime';

runtime.registerComponent(ProductCarousel, {
  type: 'ProductCarousel',
  label: 'Product Carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Images',
      type: Shape({
        type: {
          image: Image({
            label: 'Background image',
            format: Image.Format.WithDimensions,
          }),
          imageAlt: TextInput({
            label: 'Alt text',
            defaultValue: 'Product image',
            selectAll: true,
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.imageAlt || 'Product image';
      },
    }),
    autoplay: Number({
      label: 'Autoplay',
      defaultValue: 0,
      step: 0.1,
      suffix: 's',
      selectAll: true,
    }),
  },
});
