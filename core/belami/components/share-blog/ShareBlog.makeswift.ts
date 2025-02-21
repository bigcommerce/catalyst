import { lazy } from 'react';
import { runtime } from '~/lib/makeswift/runtime';
import { List, Shape, TextInput, Style, Image, Link } from '@makeswift/runtime/controls';

runtime.registerComponent(
  lazy(() => import('./ShareBlog').then(module => ({ default: module.default }))),
  {
    type: 'blog-share',
    label: 'Belami / Share Blog',
    props: {
      className: Style(),
      socialLinks: List({
        label: 'Social Links',
        type: Shape({
          type: {
            name: TextInput({ label: 'Platform Name', defaultValue: 'Facebook' }),
            url: Link({ label: 'Share Link' }),
            iconUrl: Image({ label: 'Icon Image' }),
          },
        }),
        getItemLabel: (item) => item?.name || 'Social Link',
      }),
    },
  }
);