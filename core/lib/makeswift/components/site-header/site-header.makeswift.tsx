import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftHeader } from './site-header.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

const banner = Group({
  label: 'Banner',
  preferredLayout: Group.Layout.Popover,
  props: {
    show: Checkbox({ label: 'Show banner', defaultValue: false }),
    centerText: TextInput({
      label: 'Center text',
      defaultValue: 'FREE SHIPPING IN THE US ORDERS OVER $500',
    }),
    rightText: Group({
      label: 'Right text',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({ label: 'Text', defaultValue: 'CREATE YOUR ACCOUNT' }),
        link: Link({ label: 'Link URL' }),
      },
    }),
    links: List({
      label: 'Links',
      type: Group({
        label: 'Link',
        props: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Text',
    }),
    // allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
    // id: TextInput({ label: 'Banner ID', defaultValue: 'black_friday_2025' }),
    children: Slot(),
  },
});

const logoGroup = (
  label: string,
  defaults: {
    width: number;
    height: number;
  },
) =>
  Group({
    label,
    props: {
      src: Image({ label: 'Logo' }),
      alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
      width: Number({ label: 'Max width', suffix: 'px', defaultValue: defaults.width }),
      height: Number({ label: 'Max height', suffix: 'px', defaultValue: defaults.height }),
    },
  });

const logo = Group({
  label: 'Logo',
  preferredLayout: Group.Layout.Popover,
  props: {
    desktop: logoGroup('Desktop', { width: 200, height: 40 }),
    mobile: logoGroup('Mobile', { width: 100, height: 40 }),
    link: Link({ label: 'Logo link' }),
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

const groups = List({
  label: 'Groups',
  type: Group({
    label: 'Link group',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
      links,
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    banner,
    logo,
    links: List({
      label: 'Additional links',
      type: Group({
        label: 'Link',
        props: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
          groups,
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Text',
    }),
    linksPosition: Select({
      label: 'Links position',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
    phoneNumber: TextInput({
      label: 'Phone number',
      defaultValue: '8185049333',
    }),
  },
});
