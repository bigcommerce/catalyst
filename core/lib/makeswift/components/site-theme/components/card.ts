import { Color, Group, Number } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    text: string;
    icon: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      icon: Color({ label: 'Icon', defaultValue: defaults.icon }),
    },
  });

export const card = Group({
  label: 'Card',
  preferredLayout: Group.Layout.Popover,
  props: {
    fontFamily: FontFamily({ label: 'Font', defaultValue: FontFamily.Body }),
    borderRadius: Number({ label: 'Border radius', suffix: 'px', defaultValue: 16 }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
    light: colorGroup('Light', {
      background: hsl(colors.contrast[100]),
      text: hsl(colors.foreground),
      icon: hsl(colors.foreground),
    }),
    dark: colorGroup('Dark', {
      background: hsl(colors.contrast[500]),
      text: hsl(colors.background),
      icon: hsl(colors.background),
    }),
  },
});
