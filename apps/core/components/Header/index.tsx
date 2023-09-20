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
import { ChevronDown, Search, ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PropsWithChildren, Suspense } from 'react';

import client from '~/client';

import { StoreLogo } from '../StoreLogo';

import { LinkNoCache } from './LinkNoCache';

const CartLink = ({ children }: PropsWithChildren) => (
  <NavigationMenuLink asChild>
    <LinkNoCache className="relative" href="/cart">
      {children}
    </LinkNoCache>
  </NavigationMenuLink>
);

const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return (
      <CartLink>
        <ShoppingCart aria-label="cart" />
      </CartLink>
    );
  }

  const cart = await client.getCart(cartId, {
    cache: 'no-store',
    next: {
      tags: ['cart'],
    },
  });

  const count = cart?.lineItems.totalQuantity;

  return (
    <CartLink>
      <p role="status">
        <span className="sr-only">Cart Items</span>
        <ShoppingCart aria-hidden="true" />
        {Boolean(count) && <Badge>{count}</Badge>}
      </p>
    </CartLink>
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
              <NavigationMenuTrigger className="gap-0 p-0">
                <>
                  <NavigationMenuLink asChild>
                    <Link className="grow" href={`/category/${category.entityId}`}>
                      {category.name}
                    </Link>
                  </NavigationMenuLink>
                  <span className={cs(inCollapsedNav && 'p-3')}>
                    <ChevronDown
                      aria-hidden="true"
                      className={cs(
                        'cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </span>
                </>
              </NavigationMenuTrigger>
              <NavigationMenuContent
                className={cs(
                  !inCollapsedNav && 'mx-auto flex w-[700px] flex-row gap-20',
                  inCollapsedNav && 'ps-3',
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
      <NavigationMenu>
        <NavigationMenuLink asChild className="px-0">
          <Link href="/">
            <StoreLogo />
          </Link>
        </NavigationMenuLink>
        <HeaderNav className="hidden lg:flex" />
        <div className="flex">
          <NavigationMenuList>
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
          <NavigationMenuToggle className="ms-2 lg:hidden" />
        </div>
        <NavigationMenuCollapsed>
          <HeaderNav inCollapsedNav />
        </NavigationMenuCollapsed>
      </NavigationMenu>
    </header>
  );
};
