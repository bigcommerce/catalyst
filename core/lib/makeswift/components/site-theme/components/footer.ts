import { Color, Group } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

export const footer = Group({
  label: 'Footer',
  preferredLayout: Group.Layout.Popover,
  props: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    borderTop: Color({ label: 'Border top', defaultValue: hsl(colors.contrast[100]) }),
    borderBottom: Color({ label: 'Border bottom', defaultValue: hsl(colors.primary) }),
    contactTitle: Color({ label: 'Contact title', defaultValue: hsl(colors.contrast[300]) }),
    contactText: Color({ label: 'Contact text', defaultValue: hsl(colors.foreground) }),
    socialIcon: Color({ label: 'Social icon', defaultValue: hsl(colors.contrast[400]) }),
    socialIconHover: Color({ label: 'Social icon hover', defaultValue: hsl(colors.foreground) }),
    sectionTitle: Color({ label: 'Section title', defaultValue: hsl(colors.foreground) }),
    footerLink: Color({ label: 'Footer link', defaultValue: hsl(colors.contrast[400]) }),
    footerLinkHover: Color({ label: 'Footer link hover', defaultValue: hsl(colors.foreground) }),
    footerCopyright: Color({ label: 'Footer copyright', defaultValue: hsl(colors.contrast[400]) }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
  },
});
