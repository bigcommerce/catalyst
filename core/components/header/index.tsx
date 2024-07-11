import { ShoppingCart, User } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { FragmentOf, graphql } from '~/client/graphql';

import { Link } from '../link';
import { QuickSearch } from '../quick-search';
import { StoreLogo, StoreLogoFragment } from '../store-logo';
import { Button } from '../ui/button';
import { Dropdown } from '../ui/dropdown';
import { Header as ComponentsHeader } from '../ui/header';

import { logout } from './_actions/logout';
import { CartLink } from './cart';
import { LocaleSwitcher } from './locale-switcher';

export const HeaderFragment = graphql(
  `
    fragment HeaderFragment on Site {
      settings {
        ...StoreLogoFragment
      }
      categoryTree {
        entityId
        name
        path
        children {
          entityId
          name
          path
          children {
            entityId
            name
            path
          }
        }
      }
    }
  `,
  [StoreLogoFragment],
);

interface Props {
  cart: ReactNode;
  data: FragmentOf<typeof HeaderFragment>;
}

export const Header = async ({ cart, data }: Props) => {
  const customerId = await getSessionCustomerId();

  const locale = await getLocale();
  const messages = await getMessages({ locale });

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);
  const logo = data.settings && <StoreLogo data={data.settings} />;

  return (
    <ComponentsHeader links={categoryTree} logo={logo}>
      <QuickSearch>
        <Link className="overflow-hidden text-ellipsis py-3" href="/">
          {logo}
        </Link>
      </QuickSearch>

      {customerId ? (
        <Dropdown
          items={[
            { path: '/account', name: 'My account' },
            { path: '/account/orders', name: 'Orders' },
            { path: '/account/messages', name: 'Messages' },
            { path: '/account/addresses', name: 'Addresses' },
            { path: '/account/wishlists', name: 'Wishlists' },
            { path: '/account/recently-viewed', name: 'Recently viewed' },
            { path: '/account/settings', name: 'Account settings' },
            { action: logout, name: 'Log out' },
          ]}
          trigger={
            <Button
              aria-label="Account"
              className="p-3 text-black hover:bg-transparent hover:text-primary"
              variant="subtle"
            >
              <User aria-hidden="true" />
            </Button>
          }
        />
      ) : (
        <Link aria-label="Login" className="block p-3" href="/login">
          <User />
        </Link>
      )}
      <p role="status">
        <Suspense
          fallback={
            <CartLink>
              <ShoppingCart aria-label="cart" />
            </CartLink>
          }
        >
          {cart}
        </Suspense>
      </p>
      <NextIntlClientProvider locale={locale} messages={{ Header: messages.Header ?? {} }}>
        <LocaleSwitcher />
      </NextIntlClientProvider>
    </ComponentsHeader>
  );
};
