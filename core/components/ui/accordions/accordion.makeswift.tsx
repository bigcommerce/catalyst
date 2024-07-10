import { List, Select, Shape, Slot, TextInput } from '@makeswift/runtime/controls';

import { Accordions } from '~/components/ui/accordions';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(Accordions, {
  type: 'catalyst-accordion',
  label: 'Catalyst / Accordion',
  props: {
    accordions: List({
      label: 'Accordions',
      type: Shape({
        type: {
          content: Slot(),
          title: TextInput({
            label: 'Title',
            defaultValue: 'Lorem Ipsum?',
          }),
        },
      }),
      getItemLabel() {
        return 'Slot';
      },
    }),
    type: Select({
      label: 'Type',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Multiple', value: 'multiple' },
      ],
      defaultValue: 'single',
    }),
  },
});
