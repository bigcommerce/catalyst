import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { cookies } from 'next/headers';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';

import { SearchResult } from '@/vibes/soul/primitives/navigation/index';
import { localeSchema, searchSchema } from '@/vibes/soul/primitives/navigation/schema';
import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { getSearchResults } from '~/client/queries/get-search-results';
import { revalidate } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { localeLanguageRegionMap, redirect } from '~/i18n/routing';
import { Header as HeaderSection } from '~/makeswift/components/header';

import { HeaderFragment } from './fragment';

type QuickSearchResults = ExistingResultType<typeof getSearchResults>;

const isSearchQuery = (data: unknown): data is QuickSearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

const SEARCH_PARAM_NAME = 'term';

async function search(
  state: unknown,
  formData: FormData,
): Promise<{ lastResult: SubmissionResult; searchResults: SearchResult[] | null }> {
  'use server';

  const submission = parseWithZod(formData, { schema: searchSchema(SEARCH_PARAM_NAME) });

  if (submission.status !== 'success')
    return { lastResult: submission.reply(), searchResults: null };

  const term = submission.value[SEARCH_PARAM_NAME];

  if (term == null) return { lastResult: submission.reply(), searchResults: null };

  const format = await getFormatter();
  const { data } = await getSearchResults(term);

  if (isSearchQuery(data) && data.products.length > 0) {
    return {
      lastResult: submission.reply(),
      searchResults: [
        {
          type: 'links',
          title: 'Categories',
          links:
            data.products.length > 0
              ? Object.entries(
                  data.products.reduce<Record<string, string>>((categories, product) => {
                    product.categories.edges?.forEach((category) => {
                      categories[category.node.name] = category.node.path;
                    });

                    return categories;
                  }, {}),
                ).map(([name, path]) => {
                  return { label: name, href: path };
                })
              : [],
        },
        {
          type: 'links',
          title: 'Brands',
          links:
            data.products.length > 0
              ? Object.entries(
                  data.products.reduce<Record<string, string>>((brands, product) => {
                    if (product.brand) {
                      brands[product.brand.name] = product.brand.path;
                    }

                    return brands;
                  }, {}),
                ).map(([name, path]) => {
                  return { label: name, href: path };
                })
              : [],
        },
        {
          type: 'products',
          title: 'Products',
          products: data.products.map((product) => {
            const price = pricesTransformer(product.prices, format);

            return {
              id: product.entityId.toString(),
              title: product.name,
              href: product.path,
              image: product.defaultImage
                ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
                : undefined,
              price,
            };
          }),
        },
      ],
    };
  }

  return { lastResult: submission.reply(), searchResults: null };
}

// eslint-disable-next-line @typescript-eslint/require-await
async function switchLocale(state: unknown, formData: FormData): Promise<SubmissionResult> {
  'use server';

  const submission = parseWithZod(formData, { schema: localeSchema });

  if (submission.status !== 'success') return submission.reply();

  // HACK(miguel): This is a temporary workaround to allow switching locales. Otherwise the
  // `NEXT_LOCALE` cookie will override whatever value we redirect to below.
  cookies().delete('NEXT_LOCALE');

  return redirect({ href: '/', locale: submission.value.id });
}

export const Header = async () => {
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
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
    <HeaderSection
      navigation={{
        accountHref: '/account',
        activeLocaleId: locale,
        cartHref: '/cart',
        links,
        localeAction: switchLocale,
        locales: localeLanguageRegionMap.map(({ id, flag }) => ({ id, label: flag })),
        logo: data.settings ? logoTransformer(data.settings) : undefined,
        searchAction: search,
        searchParamName: SEARCH_PARAM_NAME,
        searchInputPlaceholder: t('searchPlaceholder'),
        searchCtaLabel: t('viewAll'),
        emptySearchTitle: t('emptySearchTitle'),
        emptySearchSubtitle: t('emptySearchSubtitle'),
        searchHref: '/search',
      }}
    />
  );
};
