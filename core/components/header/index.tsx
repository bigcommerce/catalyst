import { getLocale, getTranslations } from 'next-intl/server';
import PLazy from 'p-lazy';
import { cache } from 'react';

import { HeaderSection } from '@/vibes/soul/sections/header-section';
import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, readFragment } from '~/client/graphql';
import { revalidate, TAGS, shopperCache, doNotCache } from '~/client';
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

const getLayoutData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    customerAccessToken,
    policy: shopperCache({ 
      customerAccessToken, 
      cacheForCustomer: true 
    }),
  });

  return readFragment(HeaderFragment, response).site;
});

const getLinks = async () => {
  const data = await getLayoutData();

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   */
  return {
    categories: data.categoryTree.slice(0, 6),
    pages: data.content.pages.edges.map((edge) => edge.node),
  };
};

const getLogo = async () => {
  const data = await getLayoutData();

  return logoTransformer(data.logo);
};

const getCartCount = async () => {
  const cartId = await getCartId();

  if (!cartId) {
    return 0;
  }

  const response = await client.fetch({
    document: GetCartCountQuery,
    variables: { cartId },
    policy: doNotCache({ 
      entityType: TAGS.cart 
    }),
  });

  return response.data.site.cart?.lineItems.totalQuantity ?? 0;
};

const getCurrencies = async () => {
  const data = await getLayoutData();
  const preferredCurrencyCode = await getPreferredCurrencyCode();

  return {
    currencies: data.settings.storeCurrencies,
    activeCurrency: data.settings.storeCurrencies.find(
      (currency) => currency.currencyCode === preferredCurrencyCode,
    ),
  };
};

export const Header = async () => {
  const t = await getTranslations('Components.Header');
  const locale = await getLocale();
  const currencyCode = await getPreferredCurrencyCode();

  const locales = routing.locales.map((enabledLocales) => ({
    id: enabledLocales,
    label: enabledLocales.toLocaleUpperCase(),
  }));

  const currencies = await getCurrencies();
  const defaultCurrency = currencies.currencies.find(({ isDefault }) => isDefault);
  const activeCurrencyId = currencyCode ?? defaultCurrency?.id;

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
        cartCount: PLazy.from(getCartCount),
        activeLocaleId: locale,
        locales,
        localeAction: switchLocale,
        currencies: currencies.currencies,
        activeCurrencyId,
        currencyAction: switchCurrency,
      }}
    />
  );
};
