import { Checkbox, Image, List, Shape, Slot, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftProductDescription } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-product-description';

runtime.registerComponent(MakeswiftProductDescription, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftProductDescription (private)',
  hidden: true,
  props: {
    accordions: List({
      label: 'Product info',
      type: Shape({
        type: {
          title: TextInput({ label: 'Title', defaultValue: 'Section' }),
          content: Slot(),
        },
      }),
      getItemLabel: (section) => section?.title || 'Section',
    }),
    image: Image({ label: 'Product image' }),
    showOriginal: Checkbox({ label: 'Show original info', defaultValue: true }),
    showExtras: Checkbox({ label: 'Show extras', defaultValue: false }),
    extras: Slot(),
  },
});
