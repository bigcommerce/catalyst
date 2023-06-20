import { getCart, getCategoryTree } from '@bigcommerce/catalyst-client';
import {
  HeaderLogo,
  HeaderNavLink,
  HeaderNavList,
  Header as ReactantHeader,
  HeaderNav as ReactantHeaderNav,
} from '@bigcommerce/reactant/Header';
import { Search, ShoppingCart } from 'lucide-react';
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

const HeaderNav = async () => {
  const categoryTree = await getCategoryTree();

  return (
    <ReactantHeaderNav>
      <HeaderNavList className="justify-center">
        {categoryTree.map((category) => (
          <HeaderNavLink asChild key={category.path}>
            <Link href={`/category/${category.entityId}`}>{category.name}</Link>
          </HeaderNavLink>
        ))}
      </HeaderNavList>
    </ReactantHeaderNav>
  );
};

export const Header = () => {
  return (
    <ReactantHeader>
      <HeaderLogo>
        <Link href="/">
          <StoreLogo />
        </Link>
      </HeaderLogo>

      <HeaderNav />

      <div className="flex items-center">
        <Link aria-label="Search" className="hidden sm:mx-4 sm:block" href="/search">
          <Search />
        </Link>

        <Suspense fallback={<ShoppingCart aria-hidden="true" />}>
          <Cart />
        </Suspense>
      </div>
    </ReactantHeader>
  );
};
