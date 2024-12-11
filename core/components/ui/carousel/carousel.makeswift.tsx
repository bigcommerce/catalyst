'use client';

import { Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftCarousel } from './carousel.makeswift.client';

runtime.registerComponent(MakeswiftCarousel, {
  type: 'catalyst-carousel',
  label: 'Catalyst / Carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Title', defaultValue: 'Carousel' }),
    type: Select({
      label: 'Type',
      options: [
        { label: 'Newest', value: 'newest' },
        { label: 'Featured', value: 'featured' },
      ],
      defaultValue: 'newest',
    }),
  },
});
