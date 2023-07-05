import { getCart, getCategoryTree } from '@bigcommerce/catalyst-client';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuMobile,
  NavigationMenuMobileTrigger,
} from '@bigcommerce/reactant/NavigationMenu';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import { StoreLogo } from '../StoreLogo';

import { LinkNoCache } from './LinkNoCache';

const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <ShoppingCart aria-hidden="true" />;
  }

  const cart = await getCart(cartId);

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

const HeaderNav = async ({ className }: { className?: string }) => {
  const categoryTree = await getCategoryTree();

  return (
    <NavigationMenuList className={className}>
      {categoryTree.map((category) => (
        <NavigationMenuItem key={category.path}>
          <NavigationMenuLink asChild>
            <Link href={`/category/${category.entityId}`}>{category.name}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  );
};

export const Header = () => {
  return (
    <header>
      <NavigationMenu>
        <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
          <Link href="/">
            <StoreLogo />
          </Link>
          <HeaderNav className="hidden sm:flex" />
          <NavigationMenuList className="hidden sm:flex">
            <NavigationMenuItem>
              <Link aria-label="Search" className="hidden sm:block" href="/search">
                <Search />
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Suspense fallback={<ShoppingCart aria-hidden="true" />}>
                <Cart />
              </Suspense>
            </NavigationMenuItem>
          </NavigationMenuList>
          <div className="flex items-center gap-5 sm:hidden">
            <Suspense fallback={<ShoppingCart aria-hidden="true" />}>
              <Cart />
            </Suspense>
            <NavigationMenuMobileTrigger>
              <Menu />
            </NavigationMenuMobileTrigger>
          </div>
        </div>
        <NavigationMenuMobile>
          <HeaderNav className="block" />
        </NavigationMenuMobile>
      </NavigationMenu>
    </header>
  );
};
