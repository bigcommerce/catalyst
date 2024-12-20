import { Color, Font, Shape } from '@makeswift/runtime/controls';

export const logo = Shape({
  label: 'Logo',
  layout: Shape.Layout.Popover,
  type: {
    font: Font({ label: 'Font', variant: false }),
    text: Color({ label: 'Text' }),
    focus: Color({ label: 'Focus' }),
  },
});
