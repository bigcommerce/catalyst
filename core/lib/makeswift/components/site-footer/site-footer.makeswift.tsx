import { Checkbox, Image, Link, List, Number, Shape, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftFooter } from './site-footer.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-footer';

runtime.registerComponent(MakeswiftFooter, {
  type: COMPONENT_TYPE,
  label: 'Site Footer',
  hidden: true,
  props: {
    logo: Shape({
      type: {
        show: Checkbox({ label: 'Show logo', defaultValue: true }),
        src: Image({ label: 'Logo' }),
        width: Number({ label: 'Logo width', suffix: 'px', defaultValue: 200 }),
        height: Number({ label: 'Logo height', suffix: 'px', defaultValue: 40 }),
        alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
      },
    }),
    sections: List({
      label: 'Footer group',
      type: Shape({
        type: {
          title: TextInput({ label: 'Heading', defaultValue: 'Heading' }),
          links: List({
            label: 'Links',
            type: Shape({
              type: {
                label: TextInput({ label: 'Text', defaultValue: 'Text' }),
                link: Link({ label: 'URL' }),
              },
            }),
            getItemLabel: (item) => item?.label ?? 'Text',
          }),
        },
      }),
      getItemLabel: (item) => item?.title ?? 'Heading',
    }),
    copyright: TextInput({ label: 'Copyright text' }),
  },
});
