import {
  Color,
  Link,
  List,
  Number,
  Shape,
  Slot,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import { ReactRuntime } from '@makeswift/runtime/react';

import { Footer } from './Footer';
import { runtime } from 'lib/runtime';

runtime.registerComponent(Footer, {
  type: 'footer',
  label: 'Footer',
  props: {
    className: Style(),
    backgroundColor: Color({
      label: 'Background color',
      defaultValue: '#ffffff',
    }),
    textColor: Color({
      label: 'Text color',
      defaultValue: '#000000',
    }),
    contentWidth: Number({
      label: 'Max content width',
      defaultValue: 1280,
      suffix: 'px',
      selectAll: true,
    }),
    footerSlot: Slot(),
    footerGroups: List({
      label: 'Footer groups',
      type: Shape({
        type: {
          heading: TextInput({ label: 'Group heading', defaultValue: 'Heading', selectAll: true }),
          footerLinks: List({
            label: 'Links',
            type: Shape({
              type: {
                text: TextInput({ label: 'Text', defaultValue: 'Link', selectAll: true }),
                link: Link({ label: 'On click' }),
              },
            }),
            getItemLabel(link) {
              return link?.text || 'Link';
            },
          }),
        },
      }),
      getItemLabel(group) {
        return group?.heading || 'Heading';
      },
    }),
  },
});
