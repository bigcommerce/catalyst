import { Color, Number, Shape } from '@makeswift/runtime/controls';

const colorGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      background: Color({ label: 'Background' }),
      text: Color({ label: 'Text' }),
      icon: Color({ label: 'Icon' }),
    },
  });

export const card = Shape({
  label: 'Card',
  layout: Shape.Layout.Popover,
  type: {
    borderRadius: Number({ label: 'Border radius', suffix: 'px', defaultValue: 16 }),
    focus: Color({ label: 'Focus' }),
    light: colorGroup('Light'),
    dark: colorGroup('Dark'),
  },
});
