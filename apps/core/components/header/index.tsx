import { Button } from '@bigcommerce/components/button';
import {
  NavigationMenu,
  NavigationMenuCollapsed,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
} from '@bigcommerce/components/navigation-menu';
import { ShoppingCart, User } from 'lucide-react';
import { ReactNode, Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { Link } from '~/components/link';

import { QuickSearch } from '../quick-search';
import { StoreLogo } from '../store-logo';

import { HeaderNav } from './_actions/header-nav';
import { logout } from './_actions/logout';
import { CartLink } from './cart';

export const Header = async ({ cart }: { cart: ReactNode }) => {
  const customerId = await getSessionCustomerId();

  return (
    <header>
      <NavigationMenu>
        <NavigationMenuLink asChild className="shrink-0 px-0">
          <Link href="/">
            <StoreLogo />
          </Link>
        </NavigationMenuLink>

        <HeaderNav className="hidden xl:flex" />

        <div className="flex">
          <NavigationMenuList className="h-full">
            <NavigationMenuItem>
              <QuickSearch>
                <Link className="flex" href="/">
                  <StoreLogo />
                </Link>
              </QuickSearch>
            </NavigationMenuItem>
            <NavigationMenuItem className={`hidden xl:flex ${customerId ? 'self-stretch' : ''}`}>
              {customerId ? (
                <div className="group/account flex cursor-pointer items-center">
                  <Link
                    aria-label="Account"
                    className="p-3 focus:outline-none focus:ring-4 focus:ring-blue-primary/20"
                    href="/account"
                  >
                    <User aria-hidden="true" />
                  </Link>

                  <ul className="absolute -right-12 top-full z-10 hidden cursor-default bg-white p-6 pb-8 shadow-md group-hover/account:block [&>li]:mb-2">
                    <li>
                      <Link
                        className="whitespace-nowrap font-semibold focus:outline-none focus:ring-4 focus:ring-blue-primary/20"
                        href="/account"
                      >
                        My account
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="whitespace-nowrap focus:outline-none focus:ring-4"
                        href="/account/orders"
                      >
                        Orders
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="whitespace-nowrap focus:outline-none focus:ring-4"
                        href="/account/messages"
                      >
                        Messages
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="whitespace-nowrap focus:outline-none focus:ring-4"
                        href="/account/addresses"
                      >
                        Addresses
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="whitespace-nowrap focus:outline-none focus:ring-4"
                        href="/account/wishlists"
                      >
                        Wish lists
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="whitespace-nowrap focus:outline-none focus:ring-4"
                        href="/account/recently-viewed"
                      >
                        Recently viewed
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="whitespace-nowrap focus:outline-none focus:ring-4"
                        href="/account/settings"
                      >
                        Account Settings
                      </Link>
                    </li>
                    <li>
                      <form action={logout}>
                        <Button
                          className="justify-start p-0 font-normal text-black hover:bg-transparent hover:text-black"
                          type="submit"
                          variant="subtle"
                        >
                          Log out
                        </Button>
                      </form>
                    </li>
                  </ul>
                </div>
              ) : (
                <NavigationMenuLink asChild>
                  <Link aria-label="Login" href="/login">
                    <User />
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
            <NavigationMenuItem>
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
            </NavigationMenuItem>
            <NavigationMenuToggle className="xl:hidden" />
          </NavigationMenuList>
        </div>

        <NavigationMenuCollapsed>
          <HeaderNav inCollapsedNav />
        </NavigationMenuCollapsed>
      </NavigationMenu>
    </header>
  );
};
