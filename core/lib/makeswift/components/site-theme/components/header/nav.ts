import { Color, Group } from '@makeswift/runtime/controls';

import { FontFamily, type FontFamilyCssVar } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../../base-colors';

const elementGroup = (
  label: string,
  defaults: {
    fontFamily: FontFamilyCssVar;
    text: string;
    textHover: string;
    textSelected?: string;
    background: string;
    backgroundHover: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Popover,
    props: {
      fontFamily: FontFamily({ label: 'Font', defaultValue: defaults.fontFamily }),
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      textHover: Color({ label: 'Text hover', defaultValue: defaults.textHover }),
      ...(defaults.textSelected && {
        textSelected: Color({ label: 'Text selected', defaultValue: defaults.textSelected }),
      }),
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      backgroundHover: Color({ label: 'Background hover', defaultValue: defaults.backgroundHover }),
    },
  });

const button = Group({
  label: 'Button',
  preferredLayout: Group.Layout.Popover,
  props: {
    icon: Color({ label: 'Icon', defaultValue: hsl(colors.foreground) }),
    iconHover: Color({ label: 'Icon hover', defaultValue: hsl(colors.foreground) }),
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    backgroundHover: Color({ label: 'Background hover', defaultValue: hsl(colors.contrast[100]) }),
  },
});

const menu = Group({
  label: 'Menu',
  preferredLayout: Group.Layout.Popover,
  props: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    border: Color({ label: 'Border', defaultValue: hsl(colors.foreground, 0.05) }),
  },
});

const mobile = Group({
  label: 'Mobile',
  preferredLayout: Group.Layout.Popover,
  props: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    divider: Color({ label: 'Divider', defaultValue: hsl(colors.contrast[100]) }),
    buttonIcon: Color({ label: 'Button icon', defaultValue: hsl(colors.foreground) }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.foreground),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
    subLink: elementGroup('Sub-link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.contrast[500]),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
  },
});

const search = Group({
  label: 'Search',
  preferredLayout: Group.Layout.Popover,
  props: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    border: Color({ label: 'Border', defaultValue: hsl(colors.foreground, 0.05) }),
    divider: Color({ label: 'Divider', defaultValue: hsl(colors.foreground, 0.05) }),
    icon: Color({ label: 'Icon', defaultValue: hsl(colors.contrast[500]) }),
    emptyTitle: Color({ label: 'Empty title', defaultValue: hsl(colors.foreground) }),
    emptySubtitle: Color({ label: 'Empty subtitle', defaultValue: hsl(colors.contrast[500]) }),
  },
});

const searchResult = Group({
  label: 'Search result',
  preferredLayout: Group.Layout.Popover,
  props: {
    title: Color({ label: 'Title', defaultValue: hsl(colors.foreground) }),
    titleFontFamily: FontFamily({ label: 'Title font', defaultValue: FontFamily.Accent }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.foreground),
      textHover: hsl(colors.foreground),
      background: hsl(colors.background),
      backgroundHover: hsl(colors.contrast[100]),
    }),
  },
});

const cartCount = Group({
  label: 'Cart count',
  preferredLayout: Group.Layout.Popover,
  props: {
    text: Color({ label: 'Text', defaultValue: hsl(colors.background) }),
    background: Color({ label: 'Background', defaultValue: hsl(colors.foreground) }),
  },
});

const locale = Group({
  label: 'Locale',
  preferredLayout: Group.Layout.Popover,
  props: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.contrast[400]),
      textHover: hsl(colors.foreground),
      textSelected: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
  },
});

export const nav = Group({
  label: 'Navigation',
  preferredLayout: Group.Layout.Popover,
  props: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    floatingBorder: Color({ label: 'Floating border', defaultValue: hsl(colors.foreground, 0.1) }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.foreground),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
    group: elementGroup('Group', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.foreground),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
    subLink: elementGroup('Sub-link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.contrast[500]),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
    button,
    menu,
    mobile,
    search,
    searchResult,
    cartCount,
    locale,
  },
});
