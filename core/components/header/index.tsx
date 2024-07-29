import { ShoppingCart, User } from 'lucide-react';
import { ReactNode, Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { FragmentOf, graphql } from '~/client/graphql';

import { Link } from '../link';
import { QuickSearch } from '../quick-search';
import { StoreLogo, StoreLogoFragment } from '../store-logo';
import { Button } from '../ui/button';
import { Header as ComponentsHeader } from '../ui/header';
import { Popover } from '../ui/popover';

import { logout } from './_actions/logout';
import { CartLink } from './cart';

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

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);
  const logo = data.settings && <StoreLogo data={data.settings} />;

  return (
    <ComponentsHeader items={categoryTree} logo={logo}>
      <QuickSearch>
        <Link className="overflow-hidden text-ellipsis py-3" href="/">
          {logo}
        </Link>
      </QuickSearch>

      {customerId ? (
        <Popover
          trigger={
            <Button
              aria-label="Account"
              className="p-3 text-black hover:bg-transparent hover:text-primary"
              variant="subtle"
            >
              <User aria-hidden="true" />
            </Button>
          }
        >
          <ul className="flex flex-col gap-2">
            <li>
              <Link className="block whitespace-nowrap p-3 font-semibold" href="/account">
                My account
              </Link>
            </li>
            <li>
              <Link className="block whitespace-nowrap p-3" href="/account/orders">
                Orders
              </Link>
            </li>
            <li>
              <Link className="block whitespace-nowrap p-3" href="/account/messages">
                Messages
              </Link>
            </li>
            <li>
              <Link className="block whitespace-nowrap p-3" href="/account/addresses">
                Addresses
              </Link>
            </li>
            <li>
              <Link className="block whitespace-nowrap p-3" href="/account/wishlists">
                Wish lists
              </Link>
            </li>
            <li>
              <Link className="block whitespace-nowrap p-3" href="/account/recently-viewed">
                Recently viewed
              </Link>
            </li>
            <li>
              <Link className="block whitespace-nowrap p-3" href="/account/settings">
                Account settings
              </Link>
            </li>
            <li>
              <form action={logout}>
                <Button
                  className="justify-start p-3 text-black hover:bg-transparent hover:text-primary"
                  type="submit"
                  variant="subtle"
                >
                  Log out
                </Button>
              </form>
            </li>
          </ul>
        </Popover>
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
    </ComponentsHeader>
  );
};
