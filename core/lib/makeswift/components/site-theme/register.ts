import { Color, Font, Shape } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftSiteTheme } from './client';
import layouts from './layouts';
import primitives from './primitives';
import sections from './sections';

export const COMPONENT_TYPE = 'catalyst-makeswift-theme-provider';

const baseColors = {
  primary: Color({ label: 'Primary' }),
  accent: Color({ label: 'Accent' }),
  success: Color({ label: 'Success' }),
  error: Color({ label: 'Error' }),
  warning: Color({ label: 'Warning' }),
  info: Color({ label: 'Info' }),
  background: Color({ label: 'Background' }),
  foreground: Color({ label: 'Foreground' }),
  contrast: Shape({
    label: 'Contrast',
    layout: Shape.Layout.Popover,
    type: {
      100: Color({ label: 'Contrast 100' }),
      200: Color({ label: 'Contrast 200' }),
      300: Color({ label: 'Contrast 300' }),
      400: Color({ label: 'Contrast 400' }),
      500: Color({ label: 'Contrast 500' }),
    },
  }),
};

const baseFonts = {
  heading: Font({
    label: 'Heading',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-dm-serif-text)' },
  }),
  body: Font({
    label: 'Body',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-inter)' },
  }),
  mono: Font({
    label: 'Mono',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-roboto-mono)' },
  }),
};

runtime.registerComponent(MakeswiftSiteTheme, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftSiteTheme (private)',
  hidden: true,
  props: {
    baseFonts: Shape({
      label: 'Fonts',
      layout: Shape.Layout.Popover,
      type: baseFonts,
    }),
    baseColors: Shape({
      label: 'Colors',
      layout: Shape.Layout.Popover,
      type: baseColors,
    }),
    components: Shape({
      label: 'Components',
      type: primitives,
    }),
    layouts: Shape({
      label: 'Layouts',
      type: layouts,
    }),
    sections: Shape({
      label: 'Sections',
      type: sections,
    }),
  },
});
