import 'lib/components/makeswift';

import {
  Makeswift,
  Page as MakeswiftPage,
  PageProps as MakeswiftPageProps,
} from '@makeswift/runtime/next';
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import React from 'react';

import { runtime } from '../lib/runtime';

import { BcContext, BcContextProvider, getContextData } from '../lib/context';

type ParsedUrlQuery = { path?: string[] };

export async function getStaticPaths(): Promise<GetStaticPathsResult<ParsedUrlQuery>> {
  const makeswift = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY!);
  const pages = await makeswift.getPages();

  return {
    paths: pages.map((page) => ({
      params: {
        path: page.path.split('/').filter((segment) => segment !== ''),
      },
    })),
    fallback: 'blocking',
  };
}

type Props = MakeswiftPageProps & {
  contextData: BcContext;
};

export async function getStaticProps(
  ctx: GetStaticPropsContext<ParsedUrlQuery>,
): Promise<GetStaticPropsResult<Props>> {
  const makeswift = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY!, { runtime });
  const path = `/${(ctx.params?.path ?? []).join('/')}`;
  const snapshot = await makeswift.getPageSnapshot(path, {
    preview: ctx.preview,
  });

  if (snapshot == null) {
    return { notFound: true };
  }

  const contextData = await getContextData();

  return {
    props: {
      contextData,
      snapshot,
    },
  };
}

export default function Page({ snapshot, contextData }: Props) {
  return (
    <BcContextProvider value={contextData}>
      <MakeswiftPage snapshot={snapshot} runtime={runtime} />
    </BcContextProvider>
  );
}
