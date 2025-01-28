import { getLocale, getTranslations } from 'next-intl/server';
import PLazy from 'p-lazy';

import { HeaderSection } from '@/vibes/soul/sections/header-section';
import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { TAGS } from '~/client/tags';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { routing } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { search } from './_actions/search';
import { switchCurrency } from './_actions/switch-currency';
import { switchLocale } from './_actions/switch-locale';
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

const GetLinksQuery = graphql(`
  query GetLinksQuery {
    site {
      categoryTree {
        name
        path
        children {
          name
          path
          children {
            name
            path
          }
        }
      }
    }
  }
`);

const getLinks = async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: GetLinksQuery,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.site.categoryTree.slice(0, 6);

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

const getCartCount = async () => {
  const cartId = await getCartId();

  if (!cartId) {
    return null;
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
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

  if (!data.site.cart) {
    return null;
  }

  return data.site.cart.lineItems.totalQuantity;
};

export const Header = async () => {
  const t = await getTranslations('Components.Header');
  const locale = await getLocale();

  const locales = routing.locales.map((enabledLocales) => ({
    id: enabledLocales,
    label: enabledLocales.toLocaleUpperCase(),
  }));

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: { next: { revalidate } },
  });

  const data = readFragment(HeaderFragment, response).site;

  const currencyCode = await getPreferredCurrencyCode();
  const currencies = data.currencies.edges
    ? // only show transactional currencies for now until cart prices can be rendered in display currencies
      data.currencies.edges
        .filter(({ node }) => node.isTransactional)
        .map(({ node }) => ({
          id: node.code,
          label: node.code,
          isDefault: node.isDefault,
        }))
    : [];
  const defaultCurrency = currencies.find(({ isDefault }) => isDefault);
  const activeCurrencyId = currencyCode ?? defaultCurrency?.id;

  const logo = data.settings ? logoTransformer(data.settings) : '';

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
        links: PLazy.from(getLinks),
        logo,
        mobileMenuTriggerLabel: t('toggleNavigation'),
        openSearchPopupLabel: t('Search.openSearchPopup'),
        logoLabel: t('home'),
        cartCount: PLazy.from(getCartCount),
        activeLocaleId: locale,
        locales,
        localeAction: switchLocale,
        currencies,
        activeCurrencyId,
        currencyAction: switchCurrency,
      }}
    />
  );
};
