import { Checkbox, Image, Link, List, Number, Shape, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftFooter } from './site-footer.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-footer';

runtime.registerComponent(MakeswiftFooter, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftFooter (private)',
  hidden: true,
  props: {
    logo: Shape({
      type: {
        show: Checkbox({ label: 'Show logo', defaultValue: true }),
        src: Image({ label: 'Logo' }),
        width: Number({ label: 'Width', suffix: 'px' }),
        alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
      },
    }),
    sections: List({
      label: 'Footer group',
      type: Shape({
        type: {
          heading: TextInput({ label: 'Heading', defaultValue: 'Heading' }),
          links: List({
            label: 'Links',
            type: Shape({
              type: {
                text: TextInput({ label: 'Text', defaultValue: 'Text' }),
                link: Link({ label: 'URL' }),
              },
            }),
            getItemLabel: (item) => item?.text ?? 'Text',
          }),
        },
      }),
      getItemLabel: (item) => item?.heading ?? 'Heading',
    }),
    copyright: TextInput({ label: 'Copyright text', defaultValue: 'Copyright' }),
  },
});
