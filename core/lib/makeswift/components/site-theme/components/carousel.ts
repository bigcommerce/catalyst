import { Color, Shape } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    button: string;
    scrollbar: string;
  },
) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      button: Color({ label: 'Button', defaultValue: defaults.button }),
      scrollbar: Color({ label: 'Scrollbar', defaultValue: defaults.scrollbar }),
    },
  });

export const carousel = Shape({
  label: 'Carousel',
  layout: Shape.Layout.Popover,
  type: {
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
    light: colorGroup('Light', {
      button: hsl(colors.foreground),
      scrollbar: hsl(colors.foreground),
    }),
    dark: colorGroup('Dark', {
      button: hsl(colors.background),
      scrollbar: hsl(colors.background),
    }),
  },
});
