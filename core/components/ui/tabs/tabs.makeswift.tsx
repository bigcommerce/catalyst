import { List, Shape, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { Tabs } from './tabs';

runtime.registerComponent(Tabs, {
  type: 'catalyst-tabs',
  label: 'Catalyst / Tabs',
  props: {
    className: Style(),
    tabs: List({
      label: 'Tabs',
      type: Shape({
        type: {
          content: Slot(),
          title: Slot(),
          value: TextInput({
            label: 'Unique value',
            defaultValue: Math.random().toString(36).substring(7),
          }),
        },
      }),
    }),
    label: TextInput({
      label: 'Label',
      defaultValue: 'Tabs',
    }),
  },
});
