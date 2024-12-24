import { Color, Shape } from '@makeswift/runtime/controls';

const colorGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      button: Color({ label: 'Button' }),
      scrollbar: Color({ label: 'Scrollbar' }),
    },
  });

export const carousel = Shape({
  label: 'Carousel',
  layout: Shape.Layout.Popover,
  type: {
    focus: Color({ label: 'Focus' }),
    light: colorGroup('Light'),
    dark: colorGroup('Dark'),
  },
});
