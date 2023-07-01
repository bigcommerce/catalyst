import { MakeswiftComponentType } from '@makeswift/runtime/components';
import { Color } from '@makeswift/runtime/controls';
import { Props } from '@makeswift/runtime/prop-controllers';
import { ReactRuntime } from '@makeswift/runtime/react';

import { Text } from './Text';
import { runtime } from 'lib/runtime';

// TODO: Fix type error
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
runtime.registerComponent(Text, {
  type: MakeswiftComponentType.Text,
  label: 'Text',
  props: {
    id: Props.ElementID(),
    text: Props.RichText(),
    width: Props.Width({
      format: Props.Width.Format.ClassName,
      preset: [{ deviceId: 'desktop', value: { value: 700, unit: 'px' } }],
      defaultValue: { value: 100, unit: '%' },
    }),
    margin: Props.Margin({
      format: Props.Margin.Format.ClassName,
      preset: [
        {
          deviceId: 'desktop',
          value: {
            marginTop: null,
            marginRight: 'auto',
            marginBottom: { value: 20, unit: 'px' },
            marginLeft: 'auto',
          },
        },
      ],
    }),
    linkColor: Color({
      label: 'Link color',
      defaultValue: '#3071EF',
    }),
    listMarkerColor: Color({
      label: 'List marker color',
      defaultValue: '#000000',
    }),
  },
});
