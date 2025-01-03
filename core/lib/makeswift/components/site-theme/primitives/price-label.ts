import { Color, Shape } from '@makeswift/runtime/controls';

const colorGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      text: Color({ label: 'Text' }),
      saleText: Color({ label: 'Sale text' }),
    },
  });

export const priceLabel = Shape({
  label: 'Price label',
  layout: Shape.Layout.Popover,
  type: {
    light: colorGroup('Light'),
    dark: colorGroup('Dark'),
  },
});
