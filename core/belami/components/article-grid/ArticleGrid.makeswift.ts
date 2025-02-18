import { lazy } from 'react';
import { runtime } from '~/lib/makeswift/runtime';
import { List, Shape, Style, TextInput, Image, Link } from '@makeswift/runtime/controls';

runtime.registerComponent(
  lazy(() => import('./ArticleGrid').then((module) => ({ default: module.ArticleGrid }))),
  {
    type: 'article-grid',
    label: 'Belami / Article Grid',
    props: {
      className: Style(),
      articles: List({
        label: 'Articles',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Article Title' }),
            description: TextInput({ label: 'Description', defaultValue: 'Article description' }),
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
