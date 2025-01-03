import { Color, Shape } from '@makeswift/runtime/controls';

export const footer = Shape({
  label: 'Footer',
  layout: Shape.Layout.Popover,
  type: {
    background: Color({ label: 'Background' }),
    borderTop: Color({ label: 'Border top' }),
    borderBottom: Color({ label: 'Border bottom' }),
    contactTitle: Color({ label: 'Contact title' }),
    contactText: Color({ label: 'Contact text' }),
    socialIcon: Color({ label: 'Social icon' }),
    socialIconHover: Color({ label: 'Social icon hover' }),
    sectionTitle: Color({ label: 'Section title' }),
    footerLink: Color({ label: 'Footer link' }),
    footerLinkHover: Color({ label: 'Footer link hover' }),
    footerCopyright: Color({ label: 'Footer copyright' }),
    focus: Color({ label: 'Focus' }),
  },
});
