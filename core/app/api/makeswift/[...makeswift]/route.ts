import { MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { strict } from 'assert';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
  getFonts() {
    return [
      {
        family: 'var(--font-family-body)',
        label: 'Inter',
        variants: [
          { weight: '300', style: 'normal', src: '/fonts/Inter-Variable.woff2' },
          { weight: '400', style: 'normal', src: '/fonts/Inter-Variable.woff2' },
          { weight: '500', style: 'normal', src: '/fonts/Inter-Variable.woff2' },
          { weight: '600', style: 'normal', src: '/fonts/Inter-Variable.woff2' },
          { weight: '700', style: 'normal', src: '/fonts/Inter-Variable.woff2' },
        ],
      },
      {
        family: 'var(--font-family-heading)',
        label: 'DM Serif',
        variants: [{ weight: '400', style: 'normal', src: '/fonts/DMSerifText-Regular.woff2' }],
      },
      {
        family: 'var(--font-family-mono)',
        label: 'Roboto Mono',
        variants: [{ weight: '400', style: 'normal', src: '/fonts/RobotoMono-Variable.woff2' }],
      },
    ];
  },
});

export { handler as GET, handler as POST };
