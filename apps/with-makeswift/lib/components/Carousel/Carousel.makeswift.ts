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
import { ReactRuntime } from '@makeswift/runtime/react';

import { Carousel } from './Carousel';

ReactRuntime.registerComponent(Carousel, {
  type: 'carousel',
  label: 'Carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: Shape({
        type: {
          title: TextInput({
            label: 'Title',
            defaultValue: 'Slide title',
            selectAll: true,
          }),
          text: TextArea({
            label: 'Text',
            defaultValue:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
            selectAll: true,
          }),
          image: Image({
            label: 'Background image',
            format: Image.Format.WithDimensions,
          }),
          imageAlt: TextInput({
            label: 'Alt text',
            defaultValue: 'Logo',
            selectAll: true,
          }),
          buttonText: TextInput({
            label: 'Button text',
            defaultValue: 'Shop now',
            selectAll: true,
          }),
          link: Link({
            label: 'Button link',
          }),
          buttonColor: Color({
            label: 'Button color',
            defaultValue: '#053FB0',
          }),
          buttonTextColor: Color({
            label: 'Button text color',
            defaultValue: '#ffffff',
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.title || 'Slide title';
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
