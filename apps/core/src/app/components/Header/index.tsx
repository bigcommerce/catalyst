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
    <LinkNoCache href="/cart">
      <span className="sr-only">Cart Items</span>

      <div className="relative">
        <ShoppingCart aria-hidden="true" />
        <div className="dark:border-gray-900 absolute -right-4 -top-4 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-primary text-sm font-bold text-white">
          {count}
        </div>
      </div>
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
    <NavigationMenuList className={className}>
      {categoryTree.map((category) => (
        <NavigationMenuItem key={category.path}>
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
                className={cs(!inCollapsedNav && 'flex flex-row gap-20', inCollapsedNav && 'pl-6')}
              >
                {category.children.map((childCategory1) => (
                  <ul key={childCategory1.entityId}>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                    </NavigationMenuItem>
                    {childCategory1.children.map((childCategory2) => (
                      <NavigationMenuItem key={childCategory2.entityId}>
                        <NavigationMenuLink className="font-normal" href="#">
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
      <NavigationMenu>
        <Link href="/">
          <StoreLogo />
        </Link>
        <HeaderNav className="hidden lg:flex" />
        <div className="flex gap-5">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link aria-label="Search" href="/search">
                <Search />
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Suspense fallback={<ShoppingCart aria-hidden="true" />}>
                <Cart />
              </Suspense>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuToggle className="lg:hidden">
            <Menu />
          </NavigationMenuToggle>
        </div>
        <NavigationMenuCollapsed>
          <HeaderNav className="block" inCollapsedNav />
        </NavigationMenuCollapsed>
      </NavigationMenu>
    </header>
  );
};
