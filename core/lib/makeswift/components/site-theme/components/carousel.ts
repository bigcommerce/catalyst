import { Color, Group } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    button: string;
    scrollbar: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      button: Color({ label: 'Button', defaultValue: defaults.button }),
      scrollbar: Color({ label: 'Scrollbar', defaultValue: defaults.scrollbar }),
    },
  });

export const carousel = Group({
  label: 'Carousel',
  preferredLayout: Group.Layout.Popover,
  props: {
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
