import { type Font, MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { strict } from 'assert';

import { runtime } from '~/lib/makeswift/runtime';

import '~/lib/makeswift/components';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

const defaultVariants: Font['variants'] = [
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
];

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
  getFonts() {
    return [
      {
        family: 'var(--font-family-inter)',
        label: 'Inter',
        variants: defaultVariants,
      },
      {
        family: 'var(--font-family-dm-serif-text)',
        label: 'DM Serif Text',
        variants: [{ weight: '400', style: 'normal' }],
      },
      {
        family: 'var(--font-family-roboto-mono)',
        label: 'Roboto Mono',
        variants: defaultVariants,
      },
    ];
  },
});

export { handler as GET, handler as POST };
