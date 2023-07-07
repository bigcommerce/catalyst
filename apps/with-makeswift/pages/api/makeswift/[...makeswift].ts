import { MakeswiftApiHandler } from '@makeswift/runtime/next';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export default MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY!, {
  appOrigin: process.env.MAKESWIFT_APP_ORIGIN,
  getFonts: () => [
    {
      family: 'HelveticaNeue',
      variants: [
        {
          weight: '400',
          style: 'normal',
          src: '/fonts/HelveticaNeue-Roman.woff2',
        },
        {
          weight: '700',
          style: 'normal',
          src: '/fonts/HelveticaNeue-Bold.woff2',
        },
        {
          weight: '900',
          style: 'normal',
          src: '/fonts/HelveticaNeue-Heavy.woff2',
        },
      ],
    },
    {
      family: 'Inter',
      variants: [
        {
          weight: '400',
          style: 'normal',
          src: '/fonts/Inter-Regular.woff2',
        },
        {
          weight: '600',
          style: 'normal',
          src: '/fonts/Inter-SemiBold.woff2',
        },
        {
          weight: '700',
          style: 'normal',
          src: '/fonts/Inter-Bold.woff2',
        },
        {
          weight: '900',
          style: 'normal',
          src: '/fonts/Inter-Black.woff2',
        },
      ],
    },
  ],
});
