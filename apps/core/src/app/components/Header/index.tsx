import { Badge } from '@bigcommerce/reactant/Badge';
import { cs } from '@bigcommerce/reactant/cs';
import {
  NavigationMenu,
  NavigationMenuCollapsed,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
  NavigationMenuTrigger,
} from '@bigcommerce/reactant/NavigationMenu';
import { ChevronDown, Menu, Search, ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import client from '~/client';

import { StoreLogo } from '../StoreLogo';

import { LinkNoCache } from './LinkNoCache';

const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <ShoppingCart aria-hidden="true" />;
  }

  const cart = await client.getCart(cartId);

  if (!cart) {
    return <ShoppingCart aria-hidden="true" />;
  }

  const count = cart.lineItems.totalQuantity;

  return (
    <LinkNoCache
      className="focus:ring-primary-blue/20 flex justify-between font-semibold hover:text-blue-primary focus:outline-none focus:ring-4"
      href="/cart"
    >
      <p className="relative p-3" role="status">
        <span className="sr-only">Cart Items</span>
        <ShoppingCart aria-hidden="true" />
        <Badge>{count}</Badge>
      </p>
    </LinkNoCache>
  );
};

const HeaderNav = async ({
  className,
  inCollapsedNav = false,
}: {
  className?: string;
  inCollapsedNav?: boolean;
}) => {
  const categoryTree = await client.getCategoryTree();

  return (
    <NavigationMenuList
      className={cs(
        !inCollapsedNav && 'lg:gap-4',
        inCollapsedNav && 'flex-col items-start',
        className,
      )}
    >
      {categoryTree.map((category) => (
        <NavigationMenuItem className={cs(inCollapsedNav && 'w-full')} key={category.path}>
          {category.children.length > 0 ? (
            <>
              <NavigationMenuTrigger asChild>
                <NavigationMenuLink asChild>
                  <Link href={`/category/${category.entityId}`}>
                    {category.name}{' '}
                    <ChevronDown
                      aria-hidden="true"
                      className={cs(
                        'transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuTrigger>
              <NavigationMenuContent
                className={cs(
                  !inCollapsedNav && 'mx-auto flex w-[700px] flex-row gap-20',
                  inCollapsedNav && 'pl-6',
                )}
              >
                {category.children.map((childCategory1) => (
                  <ul className={cs(inCollapsedNav && 'pb-4')} key={childCategory1.entityId}>
                    <NavigationMenuItem>
                      <NavigationMenuLink href={`/category/${childCategory1.entityId}`}>
                        {childCategory1.name}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    {childCategory1.children.map((childCategory2) => (
                      <NavigationMenuItem key={childCategory2.entityId}>
                        <NavigationMenuLink
                          className="font-normal"
                          href={`/category/${childCategory2.entityId}`}
                        >
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
              <Link href={`/category/${category.entityId}`}>{category.name}</Link>
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  );
};

export const Header = () => {
  return (
    <header>
      <NavigationMenu className="gap-6 lg:gap-8">
        <NavigationMenuLink asChild className="px-0">
          <Link href="/">
            <StoreLogo />
          </Link>
        </NavigationMenuLink>
        <HeaderNav className="hidden lg:flex" />
        <div className="flex">
          <NavigationMenuList className="lg:gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link aria-label="Search" href="/search">
                  <Search />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Suspense fallback={<ShoppingCart aria-hidden="true" />}>
                  <Cart />
                </Suspense>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuToggle className="lg:hidden" />
        </div>
        <NavigationMenuCollapsed>
          <HeaderNav inCollapsedNav />
        </NavigationMenuCollapsed>
      </NavigationMenu>
    </header>
  );
};
