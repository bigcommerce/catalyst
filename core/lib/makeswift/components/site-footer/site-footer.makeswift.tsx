import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftFooter } from './site-footer.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-footer';

const logo = Group({
  label: 'Logo',
  preferredLayout: Group.Layout.Popover,
  props: {
    show: Checkbox({ label: 'Show logo', defaultValue: true }),
    src: Image({ label: 'Logo' }),
    alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
    width: Number({ label: 'Max width', suffix: 'px', defaultValue: 200 }),
    height: Number({ label: 'Max height', suffix: 'px', defaultValue: 40 }),
  },
});

const links = List({
  label: 'Links',
  type: Group({
    label: 'Link',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

runtime.registerComponent(MakeswiftFooter, {
  type: COMPONENT_TYPE,
  label: 'Site Footer',
  hidden: true,
  props: {
    logo,
    sections: List({
      label: 'Sections',
      type: Group({
        label: 'Section',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Section' }),
          links,
        },
      }),
      getItemLabel: (item) => item?.title ?? 'Section',
    }),
    copyright: TextInput({ label: 'Copyright text' }),
    extraSlots: List({
      label: 'Extra slots',
      type: Group({
        label: 'Slot',
        props: {
          label: TextInput({ label: 'Label', defaultValue: 'Slot', selectAll: true }),
          slot: Slot(),
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Slot',
    }),
  },
});
