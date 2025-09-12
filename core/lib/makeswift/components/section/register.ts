import { Checkbox, Select, Slot, Style } from '@makeswift/runtime/controls';

import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(SectionLayout, {
  type: 'layouts-section',
  label: 'Layouts / Section',
  icon: 'layout',
  props: {
    className: Style({ properties: [...Style.Default, Style.Border] }),
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
    hideOverflow: Checkbox({
      label: 'Hide overflow',
      defaultValue: false,
    }),
  },
});
