import { Color, Font, Shape } from '@makeswift/runtime/controls';

const colorGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      background: Color({ label: 'Background' }),
      backgroundHover: Color({ label: 'Background hover' }),
      foreground: Color({ label: 'Foreground' }),
      border: Color({ label: 'Border' }),
    },
  });

export const button = Shape({
  label: 'Button',
  layout: Shape.Layout.Popover,
  type: {
    font: Font({ label: 'Font', variant: false }),
    primary: colorGroup('Primary'),
    secondary: colorGroup('Secondary'),
    tertiary: colorGroup('Tertiary'),
    ghost: colorGroup('Ghost'),
    focus: Color({ label: 'Focus' }),
  },
});
