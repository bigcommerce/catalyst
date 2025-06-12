import { Select, Slot, Style } from '@makeswift/runtime/controls';

import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(StickySidebarLayout, {
  type: 'layouts-sticky-sidebar',
  label: 'Layouts / Sticky sidebar',
  icon: 'layout',
  props: {
    className: Style({ properties: [...Style.Default, Style.Border] }),
    sidebar: Slot(),
    children: Slot(),
    containerSize: Select({
      label: 'Container size',
      options: [
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'XL' },
        { value: '2xl', label: '2XL' },
      ],
      defaultValue: '2xl',
    }),
    sidebarPosition: Select({
      label: 'Sidebar position',
      options: [
        { value: 'before', label: 'Before' },
        { value: 'after', label: 'After' },
      ],
      defaultValue: 'before',
    }),
    sidebarSize: Select({
      label: 'Sidebar width',
      options: [
        { value: '1/2', label: '1/2' },
        { value: '1/3', label: '1/3' },
        { value: '1/4', label: '1/4' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      defaultValue: '1/3',
    }),
  },
});
