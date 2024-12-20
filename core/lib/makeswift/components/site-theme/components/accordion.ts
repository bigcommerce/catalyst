import { Color, Shape } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    titleText: string;
    titleTextHover: string;
    titleIcon: string;
    titleIconHover: string;
    contentText: string;
  },
) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      titleText: Color({ label: 'Title text', defaultValue: defaults.titleText }),
      titleTextHover: Color({ label: 'Title text hover', defaultValue: defaults.titleTextHover }),
      titleIcon: Color({ label: 'Title icon', defaultValue: defaults.titleIcon }),
      titleIconHover: Color({ label: 'Title icon hover', defaultValue: defaults.titleIconHover }),
      contentText: Color({ label: 'Content text', defaultValue: defaults.contentText }),
    },
  });

export const accordion = Shape({
  label: 'Accordion',
  layout: Shape.Layout.Popover,
  type: {
    titleFontFamily: FontFamily({ label: 'Title font', defaultValue: FontFamily.Accent }),
    contentFontFamily: FontFamily({ label: 'Content font', defaultValue: FontFamily.Body }),
    light: colorGroup('Light', {
      titleText: hsl(colors.contrast[400]),
      titleTextHover: hsl(colors.foreground),
      titleIcon: hsl(colors.contrast[500]),
      titleIconHover: hsl(colors.foreground),
      contentText: hsl(colors.foreground),
    }),
    dark: colorGroup('Dark', {
      titleText: hsl(colors.contrast[200]),
      titleTextHover: hsl(colors.background),
      titleIcon: hsl(colors.contrast[200]),
      titleIconHover: hsl(colors.background),
      contentText: hsl(colors.background),
    }),
  },
});
