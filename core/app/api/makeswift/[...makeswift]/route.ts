import { MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { strict } from 'assert';

import { runtime } from '~/lib/makeswift/runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
});

export { handler as GET, handler as POST };
