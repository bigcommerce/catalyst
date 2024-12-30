import {
  Checkbox,
  Image,
  Link,
  List,
  Number,
  Select,
  Shape,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftHeader } from './site-header.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    banner: Shape({
      type: {
        show: Checkbox({ label: 'Show banner', defaultValue: false }),
        allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
        id: TextInput({ label: 'Banner ID', defaultValue: 'black_friday_2025' }),
        children: Slot(),
      },
    }),
    logo: Shape({
      type: {
        desktopSrc: Image({ label: 'Desktop logo' }),
        desktopAlt: TextInput({ label: 'Desktop logo alt', defaultValue: 'Desktop logo alt' }),
        desktopWidth: Number({ label: 'Desktop logo width', suffix: 'px', defaultValue: 200 }),
        desktopHeight: Number({ label: 'Desktop logo height', suffix: 'px', defaultValue: 40 }),
        mobileSrc: Image({ label: 'Mobile logo' }),
        mobileAlt: TextInput({ label: 'Mobile logo alt', defaultValue: 'Mobile logo alt' }),
        mobileWidth: Number({ label: 'Mobile logo width', suffix: 'px', defaultValue: 100 }),
        mobileHeight: Number({ label: 'Mobile logo height', suffix: 'px', defaultValue: 40 }),
        link: Link({ label: 'Logo link' }),
      },
    }),
    links: List({
      label: 'Additional links',
      type: Shape({
        type: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
          groups: List({
            label: 'Groups',
            type: Shape({
              type: {
                label: TextInput({ label: 'Text', defaultValue: 'Text' }),
                link: Link({ label: 'URL' }),
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
            getItemLabel: (item) => item?.label ?? 'Text',
          }),
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
  },
});
