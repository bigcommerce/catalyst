import { Color, Group } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    backgroundHover: string;
    foreground: string;
    border: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      backgroundHover: Color({ label: 'Background hover', defaultValue: defaults.backgroundHover }),
      foreground: Color({ label: 'Foreground', defaultValue: defaults.foreground }),
      border: Color({ label: 'Border', defaultValue: defaults.border }),
    },
  });

export const button = Group({
  label: 'Button',
  preferredLayout: Group.Layout.Popover,
  props: {
    fontFamily: FontFamily({ label: 'Font', defaultValue: FontFamily.Body }),
    primary: colorGroup('Primary', {
      background: hsl(colors.primary),
      backgroundHover: hsl(colors.primaryMix.white[75]),
      foreground: hsl(colors.foreground),
      border: hsl(colors.primary),
    }),
    secondary: colorGroup('Secondary', {
      background: hsl(colors.foreground),
      backgroundHover: hsl(colors.background),
      foreground: hsl(colors.background),
      border: hsl(colors.foreground),
    }),
    tertiary: colorGroup('Tertiary', {
      background: hsl(colors.background),
      backgroundHover: hsl(colors.contrast[100]),
      foreground: hsl(colors.foreground),
      border: hsl(colors.contrast[200]),
    }),
    ghost: colorGroup('Ghost', {
      background: 'transparent',
      backgroundHover: hsl(colors.foreground, 0.05),
      foreground: hsl(colors.foreground),
      border: 'transparent',
    }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
  },
});
