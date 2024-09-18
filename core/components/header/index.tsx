import { getLocale, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { localeLanguageRegionMap } from '~/i18n/routing';

import { Header as ComponentsHeader } from '../vibes/header';

import { search } from './_actions/search';
import { HeaderFragment } from './fragment';

interface Props {
  cart: ReactNode;
}

export const Header = async ({ cart }: Props) => {
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');
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
      searchAction={search}
    />
  );
};

export const HeaderSkeleton = () => (
  <header className="flex min-h-[92px] animate-pulse items-center justify-between gap-1 overflow-y-visible bg-white px-4 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
    <div className="h-16 w-40 rounded bg-slate-200" />
    <div className="hidden space-x-4 lg:flex">
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
    </div>
    <div className="flex items-center gap-2 lg:gap-4">
      <div className="h-8 w-8 rounded-full bg-slate-200" />

      <div className="flex gap-2 lg:gap-4">
        <div className="h-8 w-8 rounded-full bg-slate-200" />
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>

      <div className="h-8 w-20 rounded bg-slate-200" />

      <div className="h-8 w-8 rounded bg-slate-200 lg:hidden" />
    </div>
  </header>
);
