import { Color, Shape } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftCssTheme } from './client';
import { colors } from './theme';

export const COMPONENT_TYPE = 'catalyst-makeswift-theme-provider';

const toHsl = (hslValues: string) => `hsl(${hslValues})`;

runtime.registerComponent(MakeswiftCssTheme, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftCssTheme (private)',
  hidden: false,
  props: {
    colors: Shape({
      type: {
        primary: Color({ label: 'Primary', defaultValue: toHsl(colors.primary) }),
        accent: Color({ label: 'Accent', defaultValue: toHsl(colors.accent) }),
        success: Color({ label: 'Success', defaultValue: toHsl(colors.success) }),
        error: Color({ label: 'Error', defaultValue: toHsl(colors.error) }),
        warning: Color({ label: 'Warning', defaultValue: toHsl(colors.warning) }),
        info: Color({ label: 'Info', defaultValue: toHsl(colors.info) }),
        background: Color({ label: 'Background', defaultValue: toHsl(colors.background) }),
        foreground: Color({ label: 'Foreground', defaultValue: toHsl(colors.foreground) }),
        contrast: Shape({
          type: {
            100: Color({ label: 'Contrast 100', defaultValue: toHsl(colors.contrast[100]) }),
            200: Color({ label: 'Contrast 200', defaultValue: toHsl(colors.contrast[200]) }),
            300: Color({ label: 'Contrast 300', defaultValue: toHsl(colors.contrast[300]) }),
            400: Color({ label: 'Contrast 400', defaultValue: toHsl(colors.contrast[400]) }),
            500: Color({ label: 'Contrast 500', defaultValue: toHsl(colors.contrast[500]) }),
          },
        }),
      },
    }),
  },
});
