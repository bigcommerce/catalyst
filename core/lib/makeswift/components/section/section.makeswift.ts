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
    paddingOptionsLargeDesktop: Select({
      label: 'Container Padding (Large Desktop)',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'XSmall' },
        { value: '6', label: 'Small' },
        { value: '10', label: 'Medium' },
        { value: '14', label: 'Large' },
        { value: '16', label: 'XL' },
        { value: '20', label: '2XL' },
      ],
      defaultValue: '10',
    }),
    paddingOptionsDesktop: Select({
      label: 'Container Padding (Desktop)',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'XSmall' },
        { value: '6', label: 'Small' },
        { value: '10', label: 'Medium' },
        { value: '14', label: 'Large' },
        { value: '16', label: 'XL' },
        { value: '20', label: '2XL' },
      ],
      defaultValue: '10',
    }),
    paddingOptionsTablet: Select({
      label: 'Container Padding (Tablet)',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'XSmall' },
        { value: '6', label: 'Small' },
        { value: '10', label: 'Medium' },
        { value: '14', label: 'Large' },
        { value: '16', label: 'XL' },
        { value: '20', label: '2XL' },
      ],
      defaultValue: '6',
    }),
    paddingOptionsMobile: Select({
      label: 'Container Padding (Mobile)',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'XSmall' },
        { value: '6', label: 'Small' },
        { value: '10', label: 'Medium' },
        { value: '14', label: 'Large' },
        { value: '16', label: 'XL' },
        { value: '20', label: '2XL' },
      ],
      defaultValue: '2',
    }),
    hideOverflow: Checkbox({
      label: 'Hide overflow',
      defaultValue: false,
    }),
  },
});
