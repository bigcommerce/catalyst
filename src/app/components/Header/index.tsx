import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

import { getCategoryTree } from '@client';

import { StoreLogo } from '../StoreLogo';

const HeaderNav = async () => {
  const categoryTree = await getCategoryTree();

  return (
    <nav className="flex-auto self-center">
      <ul className="flex flex-row items-center justify-center gap-4">
        {categoryTree.map((category) => (
          <Link
            className="flex flex-row items-center p-3 font-semibold"
            href={category.path}
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

      <ShoppingCart />
    </header>
  );
};
