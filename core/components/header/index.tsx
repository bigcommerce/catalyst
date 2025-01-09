import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { SiteHeader as HeaderSection } from '~/lib/makeswift/components/site-header/site-header';

import { search } from './_actions/search';
import { HeaderFragment } from './fragment';

const GetCartCountQuery = graphql(`
  query GetCartCountQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
        entityId
        lineItems {
          totalQuantity
        }
      }
    }
  }
`);

const getLayoutData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return readFragment(HeaderFragment, response).site;
});

const getLinks = async () => {
  const data = await getLayoutData();

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);

  return categoryTree.map(({ name, path, children }) => ({
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
};

const getLogo = async () => {
  const data = await getLayoutData();

  return data.settings ? logoTransformer(data.settings) : '';
};

const getCartCount = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCartCountQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart],
      },
    },
  });

  if (!response.data.site.cart) {
    return null;
  }

  return response.data.site.cart.lineItems.totalQuantity;
};

export const Header = async () => {
  const t = await getTranslations('Components.Header');

  void getCartCount();

  return (
    <HeaderSection
      navigation={{
        accountHref: '/login',
        accountLabel: t('Icons.account'),
        cartHref: '/cart',
        cartLabel: t('Icons.cart'),
        searchHref: '/search',
        searchLabel: t('Icons.search'),
        searchParamName: 'term',
        searchAction: search,
        links: getLinks(),
        logo: getLogo(),
        mobileMenuTriggerLabel: t('toggleNavigation'),
        openSearchPopupLabel: t('Search.openSearchPopup'),
        logoLabel: t('home'),
        cartCount: null,
      }}
    />
  );
};
