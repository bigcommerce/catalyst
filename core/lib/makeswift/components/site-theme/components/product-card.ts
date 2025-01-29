import { Color, Group, Number } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    title: string;
    subtitle: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      title: Color({ label: 'Title', defaultValue: defaults.title }),
      subtitle: Color({ label: 'Subtitle', defaultValue: defaults.subtitle }),
    },
  });

export const productCard = Group({
  label: 'Product card',
  preferredLayout: Group.Layout.Popover,
  props: {
    borderRadius: Number({ label: 'Border radius', suffix: 'px', defaultValue: 16 }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
    light: colorGroup('Light', {
      background: hsl(colors.contrast[100]),
      title: hsl(colors.foreground),
      subtitle: hsl(colors.foreground, 0.75),
    }),
    dark: colorGroup('Dark', {
      background: hsl(colors.contrast[500]),
      title: hsl(colors.background),
      subtitle: hsl(colors.background, 0.75),
    }),
  },
});
