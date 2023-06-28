import { Link, List, Shape, Style, TextInput } from '@makeswift/runtime/controls';
import { ReactRuntime } from '@makeswift/runtime/react';

import { Breadcrumbs } from './Breadcrumbs';

export const props = {
  className: Style(),
  breadcrumbs: List({
    label: 'Links',
    type: Shape({
      type: {
        text: TextInput({ label: 'Text', defaultValue: 'Page name', selectAll: true }),
        link: Link({ label: 'On click' }),
      },
    }),
    getItemLabel(breadcrumb) {
      return breadcrumb?.text || 'Page name';
    },
  }),
  currentPage: TextInput({
    label: 'Current page text',
    defaultValue: 'Current page',
    selectAll: true,
  }),
};

ReactRuntime.registerComponent(Breadcrumbs, {
  type: 'breadcrumbs',
  label: 'Breadcrumbs',
  props,
});
