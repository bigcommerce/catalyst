import { Color, Shape } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    text: string;
    saleText: string;
  },
) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      saleText: Color({ label: 'Sale text', defaultValue: defaults.saleText }),
    },
  });

export const priceLabel = Shape({
  label: 'Price label',
  layout: Shape.Layout.Popover,
  type: {
    light: colorGroup('Light', {
      text: hsl(colors.foreground),
      saleText: hsl(colors.foreground),
    }),
    dark: colorGroup('Dark', {
      text: hsl(colors.background),
      saleText: hsl(colors.background),
    }),
  },
});
