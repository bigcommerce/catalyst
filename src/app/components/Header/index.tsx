import { ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import { getCart, getCategoryTree } from '@client';

import { StoreLogo } from '../StoreLogo';

const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <ShoppingCart />;
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return <ShoppingCart />;
  }

  return (
    <div>
      <ShoppingCart />
      <p>{cart.lineItems.totalQuantity}</p>
    </div>
  );
};

const HeaderNav = async () => {
  const categoryTree = await getCategoryTree();

  return (
    <nav className="flex-auto self-center">
      <ul className="flex flex-row items-center justify-center gap-4">
        {categoryTree.map((category) => (
          <Link
            className="flex flex-row items-center p-3 font-semibold"
            href={`/category/${category.entityId}`}
            key={category.path}
          >
            {category.name}
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export const Header = () => {
  return (
    <header className="my-6 flex items-center">
      <Link href="/">
        {/* @ts-expect-error Server Component */}
        <StoreLogo />
      </Link>

      {/* @ts-expect-error Server Component */}
      <HeaderNav />

      <Suspense>
        {/* @ts-expect-error Server Component */}
        <Cart />
      </Suspense>
    </header>
  );
};
