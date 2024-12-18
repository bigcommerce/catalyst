import { MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { strict } from 'assert';

import { runtime } from '~/lib/makeswift/runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
  getFonts() {
    return [
      {
        family: 'var(--font-family-dm-serif-text)',
        label: 'DM Serif Text',
        variants: [
          {
            weight: '300',
            style: 'normal',
          },
          {
            weight: '400',
            style: 'normal',
          },
          {
            weight: '500',
            style: 'normal',
          },
        ],
      },
      {
        family: 'var(--font-family-inter)',
        label: 'Inter',
        variants: [
          {
            weight: '300',
            style: 'normal',
          },
          {
            weight: '400',
            style: 'normal',
          },
          {
            weight: '500',
            style: 'normal',
          },
        ],
      },
      {
        family: 'var(--font-family-roboto-mono)',
        label: 'Roboto Mono',
        variants: [
          {
            weight: '300',
            style: 'normal',
          },
          {
            weight: '400',
            style: 'normal',
          },
          {
            weight: '500',
            style: 'normal',
          },
        ],
      },
    ];
  },
});

export { handler as GET, handler as POST };
