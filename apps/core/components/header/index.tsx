import { Button } from '@bigcommerce/components/button';
import {
  NavigationMenu,
  NavigationMenuCollapsed,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
  NavigationMenuTrigger,
} from '@bigcommerce/components/navigation-menu';
import { ChevronDown, ShoppingCart, User } from 'lucide-react';
import { ReactNode, Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { getCategoryTree } from '~/client/queries/get-category-tree';
import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import { QuickSearch } from '../quick-search';
import { StoreLogo } from '../store-logo';

import { logout } from './_actions/logout';
import { CartLink } from './cart';

const HeaderNav = async ({
  className,
  inCollapsedNav = false,
}: {
  className?: string;
  inCollapsedNav?: boolean;
}) => {
  // To prevent the navigation menu from overflowing, we limit the number of categories to 6.
  // To show a full list of categories, modify the `slice` method to remove the limit.
  // Will require modification of navigation menu styles to accommodate the additional categories.
  const categoryTree = (await getCategoryTree()).slice(0, 6);
  const customerId = await getSessionCustomerId();

  return (
    <>
      <NavigationMenuList
        className={cn(
          !inCollapsedNav && 'lg:gap-4',
          inCollapsedNav && 'flex-col items-start pb-6',
          className,
        )}
      >
        {categoryTree.map((category) => (
          <NavigationMenuItem className={cn(inCollapsedNav && 'w-full')} key={category.path}>
            {category.children.length > 0 ? (
              <>
                <NavigationMenuTrigger className="gap-0 p-0">
                  <>
                    <NavigationMenuLink asChild>
                      <Link className="grow" href={category.path}>
                        {category.name}
                      </Link>
                    </NavigationMenuLink>
                    <span className={cn(inCollapsedNav && 'p-3')}>
                      <ChevronDown
                        aria-hidden="true"
                        className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                      />
                    </span>
                  </>
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    !inCollapsedNav && 'mx-auto flex w-[700px] flex-row gap-20',
                    inCollapsedNav && 'ps-3',
                  )}
                >
                  {category.children.map((childCategory1) => (
                    <ul className={cn(inCollapsedNav && 'pb-4')} key={childCategory1.entityId}>
                      <NavigationMenuItem>
                        <NavigationMenuLink href={childCategory1.path}>
                          {childCategory1.name}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      {childCategory1.children.map((childCategory2) => (
                        <NavigationMenuItem key={childCategory2.entityId}>
                          <NavigationMenuLink className="font-normal" href={childCategory2.path}>
                            {childCategory2.name}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </ul>
                  ))}
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link href={category.path}>{category.name}</Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuList
        className={cn(
          'border-t border-gray-200 pt-6 lg:hidden',
          !inCollapsedNav && 'hidden',
          inCollapsedNav && 'flex-col items-start',
        )}
      >
        <NavigationMenuItem className={cn(inCollapsedNav && 'w-full')}>
          {customerId ? (
            <NavigationMenuLink href="/account">
              Your Account <User />
            </NavigationMenuLink>
          ) : (
            <NavigationMenuLink href="/login">
              {/* TODO: add Log out for mobile */}
              Log in <User />
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </>
  );
};

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
        <HeaderNav className="hidden lg:flex" />
        <div className="flex lg:self-stretch">
          <NavigationMenuList className="h-full">
            <NavigationMenuItem>
              <QuickSearch>
                <Link className="flex" href="/">
                  <StoreLogo />
                </Link>
              </QuickSearch>
            </NavigationMenuItem>
            <NavigationMenuItem className={`hidden lg:flex ${customerId ? 'self-stretch' : ''}`}>
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
          </NavigationMenuList>
          <NavigationMenuToggle className="ms-2 lg:hidden" />
        </div>
        <NavigationMenuCollapsed>
          <HeaderNav inCollapsedNav />
        </NavigationMenuCollapsed>
      </NavigationMenu>
    </header>
  );
};
