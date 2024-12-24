import { Number, Shape } from '@makeswift/runtime/controls';

const widthGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      medium: Number({ label: 'Medium', suffix: 'px', defaultValue: 768 }),
      lg: Number({ label: 'Large', suffix: 'px', defaultValue: 1024 }),
      xl: Number({ label: 'XL', suffix: 'px', defaultValue: 1200 }),
      '2xl': Number({ label: '2XL', suffix: 'px', defaultValue: 1536 }),
    },
  });

export const section = Shape({
  label: 'Section',
  layout: Shape.Layout.Popover,
  type: {
    maxWidth: widthGroup('Max width'),
  },
});
