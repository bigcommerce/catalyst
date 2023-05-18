import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { getCategoryTree, getStoreLogo } from '@client';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Catalyst Store',
  description: 'Example store built with Catalyst',
};

const StoreLogo = async () => {
  const { logoV2: logo, storeName } = await getStoreLogo();

  if (logo.__typename === 'StoreTextLogo') {
    return <span className="text-2xl font-black">{logo.text}</span>;
  }

  return (
    <Image
      alt={logo.image.altText ? logo.image.altText : storeName}
      height={32}
      priority
      src={logo.image.url}
      width={155}
    />
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

const Header = () => {
  return (
    <header>
      <div className="relative mx-6 my-9 flex items-center md:container sm:mx-10 md:mx-auto md:my-6">
        <Link href="/">
          {/* @ts-expect-error Server Component */}
          <StoreLogo />
        </Link>

        {/* @ts-expect-error Server Component */}
        <HeaderNav />
      </div>
    </header>
  );
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={inter.variable} lang="en">
      <body>
        <Header />

        {children}
      </body>
    </html>
  );
}
