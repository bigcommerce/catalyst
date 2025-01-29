import { Color, Group } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

export const logo = Group({
  label: 'Logo',
  preferredLayout: Group.Layout.Popover,
  props: {
    fontFamily: FontFamily({ label: 'Font', defaultValue: FontFamily.Heading }),
    text: Color({ label: 'Text', defaultValue: hsl(colors.foreground) }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
  },
});
