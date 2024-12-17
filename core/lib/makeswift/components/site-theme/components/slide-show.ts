import { Color, Shape } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

export const slideshow = Shape({
  label: 'Slideshow',
  layout: Shape.Layout.Popover,
  type: {
    titleFontFamily: FontFamily({ label: 'Title font', defaultValue: FontFamily.Heading }),
    descriptionFontFamily: FontFamily({ label: 'Description font', defaultValue: FontFamily.Body }),
    numberFontFamily: FontFamily({ label: 'Number font', defaultValue: FontFamily.Accent }),
    title: Color({ label: 'Title', defaultValue: hsl(colors.background) }),
    description: Color({ label: 'Description', defaultValue: hsl(colors.background, 0.8) }),
    number: Color({ label: 'Number', defaultValue: hsl(colors.background) }),
    background: Color({ label: 'Background', defaultValue: hsl(colors.primaryMix.black[75]) }),
    mask: Color({ label: 'Mask', defaultValue: hsl(colors.foreground, 0.8) }),
    pagination: Color({ label: 'Pagination', defaultValue: hsl(colors.background) }),
    playBorder: Color({ label: 'Play border', defaultValue: hsl(colors.contrast[300], 0.5) }),
    playBorderHover: Color({
      label: 'Play border hover',
      defaultValue: hsl(colors.contrast[300], 0.8),
    }),
    playText: Color({ label: 'Play text', defaultValue: hsl(colors.background) }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
  },
});
