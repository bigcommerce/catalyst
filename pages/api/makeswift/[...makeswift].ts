import { MakeswiftApiHandler } from '@makeswift/runtime/next';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export default MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY!, {
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
});
