import { getLocale } from 'next-intl/server';

import { Header as ComponentsHeader } from '@/vibes/soul/components/header';
import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { localeLanguageRegionMap } from '~/i18n/routing';

import { HeaderFragment } from './fragment';

export const Header = async () => {
  const locale = await getLocale();
  const customerId = await getSessionCustomerId();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

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

  return (
    <ComponentsHeader
      accountHref="/account"
      activeLocale={locale}
      cartHref="/cart"
      links={links}
      locales={localeLanguageRegionMap}
      logo={data.settings ? logoTransformer(data.settings) : undefined}
      searchHref="/search"
    />
  );
};
