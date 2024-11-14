import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { notFound } from 'next/navigation';

import { getSessionCustomerAccessToken } from '~/auth';
import { client as gqlClient } from '~/client';
import { graphql } from '~/client/graphql';
import { defaultLocale, locales } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';

import { CustomerContext } from './customer-context';

interface CatchAllParams {
  locale: string;
  rest: string[];
}

export async function generateStaticParams() {
  const pages = await client.getPages().toArray();

  return pages
    .filter((page) => page.path !== '/')
    .flatMap((page) =>
      locales.map((locale) => ({
        rest: page.path.split('/').filter((segment) => segment !== ''),
        // Remove eslint disable once more locales are added

        locale: locale === defaultLocale ? undefined : locale,
      })),
    );
}

const GetCustomerGroup = graphql(`
  query CustomerGroup {
    customer {
      customerGroupId
    }
  }
`);

export default async function CatchAllPage({ params }: { params: CatchAllParams }) {
  const path = `/${params.rest.join('/')}`;

  const snapshot = await client.getPageSnapshot(path, {
    siteVersion: getSiteVersion(),
    locale: params.locale === defaultLocale ? undefined : params.locale,
  });

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await gqlClient.fetch({
    document: GetCustomerGroup,
    customerAccessToken,
  });

  console.log(data);

  if (snapshot == null) return notFound();

  return <MakeswiftPage snapshot={snapshot} />;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
