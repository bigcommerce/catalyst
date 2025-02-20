import { lazy } from 'react';
import { runtime } from '~/lib/makeswift/runtime';
import { List, Shape, Style, TextInput, Image, Link } from '@makeswift/runtime/controls';

runtime.registerComponent(
  lazy(() => import('./BlogUi').then((module) => ({ default: module.BlogUi }))),
  {
    type: 'blog-ui',
    label: 'Belami / BlogUI',
    props: {
      className: Style(),
      articles: List({
        label: 'Articles',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Article Title' }),
            image: Image({ label: 'Image' }),
            imageLink: Link({ label: 'Image Link'}),
            readMoreLink: Link({ label: 'Read More Link'}),
          },
        }),
        getItemLabel: (article) => article?.title || 'Article Item',
      }),
    },
  }
);
