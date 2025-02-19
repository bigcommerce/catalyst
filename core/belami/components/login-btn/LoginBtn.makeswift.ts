import { lazy } from 'react';
import { runtime } from '~/lib/makeswift/runtime';
import { List, Shape, TextInput, Link } from '@makeswift/runtime/controls';

runtime.registerComponent(
  lazy(() => import('./LoginBtn').then((module) => ({ default: module.LoginBtn }))),

  {
    type: 'login-btn',
    label: 'Belami / Login Btn',
    props: {
      className: TextInput({ label: 'Custom Class' }),
      items: List({
        label: 'Links',
        type: Shape({
          type: {
            text: TextInput({ label: 'Text', defaultValue: 'SIGN UP' }),
            link: Link({ label: 'Link' }),
          },
        }),
        getItemLabel: (item) => item?.text || 'Link Item',
      }),
    },
  }
);
