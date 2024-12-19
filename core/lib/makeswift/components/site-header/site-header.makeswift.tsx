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
  label: 'MakeswiftHeader (private)',
  hidden: true,
  props: {
    banner: Shape({
      type: {
        show: Checkbox({ label: 'Show banner', defaultValue: true }),
        allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
        banner: Slot(),
      },
    }),
    logo: Shape({
      type: {
        desktopSrc: Image({ label: 'Desktop logo' }),
        desktopAlt: TextInput({ label: 'Desktop logo alt', defaultValue: 'Desktop logo alt' }),
        desktopWidth: Number({ label: 'Desktop logo width', suffix: 'px' }),
        mobileSrc: Image({ label: 'Mobile logo' }),
        mobileAlt: TextInput({ label: 'Mobile logo alt', defaultValue: 'Mobile logo alt' }),
        mobileWidth: Number({ label: 'Mobile logo width', suffix: 'px' }),
        link: Link({ label: 'Logo link' }),
      },
    }),
    links: List({
      label: 'Additional links',
      type: Shape({
        type: {
          text: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
          subLinks: List({
            label: 'Sub links',
            type: Shape({
              type: {
                text: TextInput({ label: 'Text', defaultValue: 'Text' }),
                link: Link({ label: 'URL' }),
              },
            }),
          }),
        },
      }),
      getItemLabel: (item) => item?.text ?? 'Text',
    }),
    linksPosition: Select({
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
  },
});
