import { Image, List, Number, Shape, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { SCCarousel } from './SCCarousel';
import { runtime } from 'lib/runtime';

runtime.registerComponent(SCCarousel, {
  type: 'SCCarousel',
  label: 'SC Carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: Shape({
        type: {
          image: Image({
            label: 'Background image',
            format: Image.Format.WithDimensions,
          }),
          imageAlt: TextInput({
            label: 'Alt text',
            defaultValue: 'Slide image',
            selectAll: true,
          }),
          children: Slot(),
        },
      }),
      getItemLabel(slide) {
        return slide?.imageAlt || 'Slide image';
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
