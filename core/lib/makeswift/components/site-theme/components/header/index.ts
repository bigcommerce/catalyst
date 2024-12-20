import { Shape } from '@makeswift/runtime/controls';

import { banner } from './banner';
import { nav } from './nav';

export const header = Shape({
  label: 'Header',
  layout: Shape.Layout.Popover,
  type: {
    banner,
    nav,
  },
});
