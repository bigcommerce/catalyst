import { Checkbox, Group, List, Select, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCarousel } from './client';

runtime.registerComponent(MSCarousel, {
  type: 'primitive-carousel',
  label: 'Basic / Carousel',
  icon: 'carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Items',
      type: Group({
        label: 'Item',
        props: {
          name: TextInput({ label: 'Name', defaultValue: '' }),
          children: Slot(),
        },
      }),
      getItemLabel(slide) {
        return slide?.name || 'Item';
      },
    }),
    showScrollbar: Checkbox({
      label: 'Show scrollbar',
      defaultValue: true,
    }),
    showArrows: Checkbox({
      label: 'Show arrows',
      defaultValue: true,
    }),
    colorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
    hideOverflow: Checkbox({
      label: 'Hide overflow',
      defaultValue: true,
    }),
  },
});
