import { Group, List, Select, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSAccordion } from './client';

runtime.registerComponent(MSAccordion, {
  type: 'primitive-accordions',
  label: 'Basic / Accordion',
  icon: 'carousel',
  props: {
    className: Style(),
    items: List({
      label: 'Items',
      type: Group({
        label: 'Accordion item',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'This is an item title' }),
          children: Slot(),
        },
      }),
      getItemLabel(accordion) {
        return accordion?.title || 'Untitled item';
      },
    }),
    type: Select({
      label: 'Selection type',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'multiple', label: 'Multiple' },
      ],
      defaultValue: 'multiple',
    }),
    colorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
  },
});
