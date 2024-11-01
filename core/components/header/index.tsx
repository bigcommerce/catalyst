import { getLocale } from 'next-intl/server';
import { getSiteVersion } from '@makeswift/runtime/next/server';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { defaultLocale } from '~/i18n/routing';
import { client as makeswiftClient } from '~/lib/makeswift/client';

import { getSearchResults } from './_actions/get-search-results';
import { HeaderFragment } from './fragment';
import { HeaderProvider } from './header-client';
import { MakeswiftProvider } from '~/lib/makeswift/provider';
import { draftMode } from 'next/headers';

const MAKESWIFT_HEADER_SNAPSHOT_ID = 'HEADER';

export const Header = async () => {
  const locale = await getLocale();
  const customerId = await getSessionCustomerId();
  const snapshot = await makeswiftClient.getComponentSnapshot(MAKESWIFT_HEADER_SNAPSHOT_ID, {
    locale: locale === defaultLocale ? undefined : locale,
    siteVersion: getSiteVersion(),
  });

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    // fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
    fetchOptions: { cache: 'no-store' },
  });

  console.log(JSON.stringify(response, null, 2));

  const data = readFragment(HeaderFragment, response).site;

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);

  const links = categoryTree.map(({ name, path, children }) => ({
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));

  const logo = data.settings ? logoTransformer(data.settings) : undefined;

  return (
    <MakeswiftProvider previewMode={draftMode().isEnabled}>
      <HeaderProvider
        links={links}
        locale={locale}
        logo={logo}
        snapshot={snapshot}
      ></HeaderProvider>
    </MakeswiftProvider>
  );
};
