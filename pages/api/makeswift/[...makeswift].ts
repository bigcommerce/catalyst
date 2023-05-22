import { MakeswiftApiHandler } from '@makeswift/runtime/next';

export default MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY!, {
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
});
