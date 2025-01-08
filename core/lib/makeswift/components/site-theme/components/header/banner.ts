import { Color, Shape } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../../base-colors';

const closeButton = Shape({
  label: 'Close button',
  type: {
    icon: Color({ label: 'Icon', defaultValue: hsl(colors.foreground, 0.5) }),
    iconHover: Color({ label: 'Icon hover', defaultValue: hsl(colors.foreground) }),
    background: Color({ label: 'Background', defaultValue: 'transparent' }),
    backgroundHover: Color({
      label: 'Background hover',
      defaultValue: hsl(colors.background, 0.4),
    }),
  },
});

export const banner = Shape({
  label: 'Banner',
  layout: Shape.Layout.Popover,
  type: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.primary) }),
    text: Color({ label: 'Text', defaultValue: hsl(colors.foreground) }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.foreground) }),
    close: closeButton,
  },
});