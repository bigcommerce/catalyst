import { Color, Font, Shape } from '@makeswift/runtime/controls';

export const slideshow = Shape({
  label: 'Slideshow',
  layout: Shape.Layout.Popover,
  type: {
    titleFont: Font({ label: 'Title font', variant: false }),
    descriptionFont: Font({ label: 'Description font', variant: false }),
    numberFont: Font({ label: 'Number font', variant: false }),
    title: Color({ label: 'Title' }),
    description: Color({ label: 'Description' }),
    number: Color({ label: 'Number' }),
    background: Color({ label: 'Background' }),
    mask: Color({ label: 'Mask' }),
    pagination: Color({ label: 'Pagination' }),
    playBorder: Color({ label: 'Play border' }),
    playBorderHover: Color({ label: 'Play border hover' }),
    playText: Color({ label: 'Play text' }),
    focus: Color({ label: 'Focus' }),
  },
});
