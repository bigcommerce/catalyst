import { Link, List, Shape, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftFooter } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-footer';

runtime.registerComponent(MakeswiftFooter, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftFooter (private)',
  hidden: true,
  props: {
    sections: List({
      label: 'Sections',
      type: Shape({
        type: {
          title: TextInput({ label: 'Title', defaultValue: 'Section' }),
          links: List({
            label: 'Links',
            type: Shape({
              type: {
                label: TextInput({ label: 'Label', defaultValue: 'Link' }),
                link: Link({ label: 'URL' }),
              },
            }),
            getItemLabel: (item) => item?.label ?? 'Link',
          }),
        },
      }),
      getItemLabel: (item) => item?.title ?? 'Section',
    }),
  },
});
