import { Group, Number } from '@makeswift/runtime/controls';

const widthGroup = (label: string) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      medium: Number({ label: 'Medium', suffix: 'px', defaultValue: 768 }),
      lg: Number({ label: 'Large', suffix: 'px', defaultValue: 1024 }),
      xl: Number({ label: 'XL', suffix: 'px', defaultValue: 1200 }),
      '2xl': Number({ label: '2XL', suffix: 'px', defaultValue: 1536 }),
    },
  });

export const section = Group({
  label: 'Section',
  preferredLayout: Group.Layout.Popover,
  props: {
    maxWidth: widthGroup('Max width'),
  },
});
