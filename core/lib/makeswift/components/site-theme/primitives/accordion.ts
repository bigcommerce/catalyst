import { Color, Font, Shape } from '@makeswift/runtime/controls';

const colorGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Inline,
    type: {
      titleText: Color({ label: 'Title text' }),
      titleTextHover: Color({ label: 'Title text hover' }),
      titleIcon: Color({ label: 'Title icon' }),
      titleIconHover: Color({ label: 'Title icon hover' }),
      contentText: Color({ label: 'Content text' }),
    },
  });

export const accordion = Shape({
  label: 'Accordion',
  layout: Shape.Layout.Popover,
  type: {
    titleFont: Font({ label: 'Title font', variant: false }),
    contentFont: Font({ label: 'Content font', variant: false }),
    light: colorGroup('Light'),
    dark: colorGroup('Dark'),
  },
});
