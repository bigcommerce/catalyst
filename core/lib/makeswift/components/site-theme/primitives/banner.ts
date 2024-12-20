import { Color, Shape } from '@makeswift/runtime/controls';

const closeButton = Shape({
  label: 'Close button',
  type: {
    icon: Color({ label: 'Icon' }),
    iconHover: Color({ label: 'Icon hover' }),
    background: Color({ label: 'Background' }),
    backgroundHover: Color({ label: 'Background hover' }),
  },
});

export const banner = Shape({
  label: 'Banner',
  layout: Shape.Layout.Popover,
  type: {
    background: Color({ label: 'Background' }),
    text: Color({ label: 'Text' }),
    focus: Color({ label: 'Focus' }),
    close: closeButton,
  },
});
