import { ReactRuntime } from '@makeswift/runtime/react';
import { MakeswiftComponentType } from './constants';
import { lazy } from 'react';
import { ElementID, Margin, TextArea, Width } from '@makeswift/prop-controllers';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
    lazy(() => import('./Embed').then((module) => ({ default: module.default }))),
  {
    type: MakeswiftComponentType.Embed,
    label: 'Belami / Embed',
    props: {
      id: ElementID(),
      html: TextArea({ label: 'Code', rows: 20 }),
      width: Width({ format: Width.Format.ClassName }),
      margin: Margin({ format: Margin.Format.ClassName }),
    },
  },
);
