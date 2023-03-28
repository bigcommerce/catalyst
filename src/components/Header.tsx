import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { Cart } from './cart';
import { StoreLogo } from './Logo';
import { Search } from './Search';

export type { StoreLogo } from './Logo';

interface Category {
  name: string;
  path: string;
  children?: Category[];
}

export interface HeaderSiteQuery {
  categoryTree: Category[];
  settings: {
    storeName: string;
    logoV2: StoreLogo;
  };
}

export const query = {
  fragmentName: 'HeaderQuery',
  fragment: /* GraphQL */ `
    fragment HeaderQuery on Site {
      categoryTree {
        ...Category
        children {
          ...Category
          children {
            ...Category
          }
        }
      }
      settings {
        storeName
        logoV2 {
          __typename
          ... on StoreTextLogo {
            text
          }
          ... on StoreImageLogo {
            image {
              url(width: 155)
              altText
            }
          }
        }
      }
    }

    fragment Category on CategoryTreeItem {
      name
      path
    }
  `,
};

type HeaderProps = HeaderSiteQuery;

export const Header = ({ categoryTree, settings }: HeaderProps) => {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const { storeName, logoV2 } = settings;

  const handleMouseOver = (category: Category) => {
    setCurrentCategory(category);
    clearTimeout(timer.current);
  };

  const handleMouseOut = () => {
    timer.current = setTimeout(() => {
      setCurrentCategory(undefined);
    }, 1000);
  };

  return (
    <header>
      <div className="my-9 md:my-6 mx-6 sm:mx-10 md:container md:mx-auto flex items-center relative">
        <StoreLogo isHomePage={router.pathname === '/'} logo={logoV2} storeName={storeName} />
        <nav className="flex-auto self-center">
          <ul className="flex flex-row gap-4 items-center justify-center">
            {categoryTree.map((category) => (
              // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
              <li
                key={category.path}
                onMouseOut={handleMouseOut}
                onMouseOver={() => handleMouseOver(category)}
              >
                <Link
                  className="p-3 font-semibold block"
                  href={category.path}
                  {...(category.children &&
                  category.children.length > 0 &&
                  currentCategory === category
                    ? { 'aria-expanded': 'true' }
                    : { 'aria-expanded': 'false' })}
                >
                  {category.name}
                </Link>
                {category.children && category.children.length > 0 ? (
                  <ul
                    className={`${
                      currentCategory === category ? 'flex' : 'hidden'
                    } absolute w-full top-full left-0 bg-white shadow-lg z-10 p-8 flex-row flex-wrap justify-center gap-4`}
                  >
                    {category.children.map((child) => (
                      <li className="basis-1/6" key={child.path}>
                        <Link className="font-semibold" href={child.path}>
                          {child.name}
                        </Link>
                        {child.children && child.children.length > 0 ? (
                          <ul>
                            {child.children.map((subchild) => (
                              <li className="py-1 first:pt-2 last:pb-0" key={subchild.path}>
                                <Link href={subchild.path}>{subchild.name}</Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
        <Search />
        <Cart />
      </div>
    </header>
  );
};
