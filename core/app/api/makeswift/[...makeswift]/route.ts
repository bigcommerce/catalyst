import { Font, MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { NextRequest } from 'next/server';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

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

const getHandler = (apiKey: string, apiOrigin: string | undefined, appOrigin: string | undefined) => {
  return MakeswiftApiHandler(apiKey, {
    apiOrigin,
    appOrigin,
    runtime,
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
};

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { makeswift: string };
  },
) {
  const apiKey = process.env.MAKESWIFT_SITE_API_KEY;
  const apiOrigin = process.env.MAKESWIFT_API_ORIGIN;
  const appOrigin = process.env.MAKESWIFT_APP_ORIGIN;

  if (!apiKey) {
    throw new Error('MAKESWIFT_SITE_API_KEY is required');
  }

  return getHandler(apiKey, apiOrigin, appOrigin)(request, { params });
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { makeswift: string };
  },
) {
  const apiKey = process.env.MAKESWIFT_SITE_API_KEY;
  const apiOrigin = process.env.MAKESWIFT_API_ORIGIN;
  const appOrigin = process.env.MAKESWIFT_APP_ORIGIN;

  if (!apiKey) {
    throw new Error('MAKESWIFT_SITE_API_KEY is required');
  }

  return getHandler(apiKey, apiOrigin, appOrigin)(request, { params });
}
