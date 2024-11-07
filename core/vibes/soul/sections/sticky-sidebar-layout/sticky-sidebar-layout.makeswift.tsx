import { Select, Slot, Style } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { StickySidebarLayout } from '.';

runtime.registerComponent(StickySidebarLayout, {
  type: 'sticky-sidebar-layout',
  label: 'Layouts / Sticky sidebar',
  // icon: "accordion", TODO: (drew) add icon
  props: {
    className: Style(),
    sidebar: Slot(),
    children: Slot(),
    sidebarPosition: Select({
      label: 'Sidebar Position',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    }),
    sidebarSize: Select({
      label: 'Sidebar Size',
      options: [
        { value: '1/2', label: '1/2' },
        { value: '1/3', label: '1/3' },
        { value: '1/4', label: '1/4' },
        { value: 'small', label: 'Small (fixed)' },
        { value: 'medium', label: 'Medium (fixed)' },
        { value: 'large', label: 'Large (fixed)' },
      ],
      defaultValue: '1/3',
    }),
  },
});
