import '../lib/reactant/makeswift';

import {
  Makeswift,
  Page as MakeswiftPage,
  PageProps as MakeswiftPageProps,
} from '@makeswift/runtime/next';
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from 'next';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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

type Props = MakeswiftPageProps;

export async function getStaticProps(
  ctx: GetStaticPropsContext<ParsedUrlQuery>,
): Promise<GetStaticPropsResult<Props>> {
  const makeswift = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY!);
  const path = `/${(ctx.params?.path ?? []).join('/')}`;
  const snapshot = await makeswift.getPageSnapshot(path, {
    preview: ctx.preview,
  });

  if (snapshot == null) {
    return { notFound: true };
  }

  return { props: { snapshot } };
}

export default function Page({ snapshot }: Props) {
  return <MakeswiftPage snapshot={snapshot} />;
}
