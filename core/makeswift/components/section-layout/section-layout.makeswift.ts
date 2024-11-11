import { Select, Slot, Style } from '@makeswift/runtime/controls';

import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(SectionLayout, {
  type: 'section-layout',
  label: 'Layouts / Section',
  // icon: "accordion", TODO: (drew) add icon
  props: {
    className: Style({ properties: [Style.Border, Style.BorderRadius] }),
    children: Slot(),
    containerSize: Select({
      label: 'Container Size',
      options: [
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'XL' },
        { value: '2xl', label: '2XL' },
      ],
      defaultValue: '2xl',
    }),
  },
});
