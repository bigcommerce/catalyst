import { Color, Group } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    text: string;
    saleText: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      saleText: Color({ label: 'Sale text', defaultValue: defaults.saleText }),
    },
  });

export const price = Group({
  label: 'Price label',
  preferredLayout: Group.Layout.Popover,
  props: {
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
