import { Group } from '@makeswift/runtime/controls';

import { banner } from './banner';
import { nav } from './nav';

export const header = Group({
  label: 'Header',
  preferredLayout: Group.Layout.Popover,
  props: {
    banner,
    nav,
  },
});
