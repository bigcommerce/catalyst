import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { StoreLogo } from './Logo';

export type { StoreLogo } from './Logo';

interface Category {
  name: string;
  path: string;
  children?: Category[];
}

export interface Page {
  entityId: number;
  name: string;
  parentEntityId: number | null;
  path: string;
  __typename: string;
}

interface PageHierarchy extends Page {
  children: PageHierarchy[];
}

export interface HeaderSiteQuery {
  categoryTree: Category[];
  content: {
    pages: {
      edges: Array<{
        node: Page;
      }>;
    };
  };
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
      content {
        pages {
          edges {
            node {
              __typename
              entityId
              name
              parentEntityId
              ... on NormalPage {
                path
              }
            }
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

const parsePageHierarchy = (pageNodes: Array<{ node: Page }>) => {
  //   Example: {
  //     0: [Page1, Page2],
  //     1: [Page3],
  //     2: [],
  //     3: [],
  //     4: [],
  //     5: [Page4],
  //     6: [Page5],
  //   }
  const pageChildrenMap: { [pageEntityId: number]: Page[] } = {};
  const pageHierarchy: PageHierarchy[] = [];

  /* eslint-disable @typescript-eslint/no-unnecessary-condition */
  pageNodes.forEach(({ node: page }) => {
    if (page.__typename !== 'NormalPage') {
      return;
    }

    // root page
    if (page.parentEntityId === null) {
      pageChildrenMap[page.entityId] = pageChildrenMap[page.entityId] || [];
      pageHierarchy.push({ ...page, ...{ children: [] } });
      // child page
    } else {
      pageChildrenMap[page.entityId] = pageChildrenMap[page.entityId] || [];
      pageChildrenMap[page.parentEntityId] = pageChildrenMap[page.parentEntityId] || [];
      pageChildrenMap[page.parentEntityId].push(page);
    }
  });
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */

  return pageHierarchy.map((rootPage) => ({
    ...rootPage,
    ...{
      children: pageChildrenMap[rootPage.entityId].map((childPage) => ({
        ...childPage,
        ...{ children: pageChildrenMap[childPage.entityId] },
      })),
    },
  }));
};

export const Header = ({ categoryTree, content, settings }: HeaderProps) => {
  const router = useRouter();
  const [currentMenuItem, setCurrentMenuItem] = useState<Category | PageHierarchy | undefined>(
    undefined,
  );
  const [menuItems] = useState<Array<Category | PageHierarchy>>(
    categoryTree.concat(parsePageHierarchy(content.pages.edges)),
  );
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const { storeName, logoV2 } = settings;

  const handleMouseOver = (menuItem: Category | PageHierarchy) => {
    setCurrentMenuItem(menuItem);
    clearTimeout(timer.current);
  };

  const handleMouseOut = () => {
    timer.current = setTimeout(() => {
      setCurrentMenuItem(undefined);
    }, 1000);
  };

  return (
    <header>
      <div className="my-9 md:my-6 mx-6 sm:mx-10 md:container md:mx-auto flex items-center relative">
        <StoreLogo isHomePage={router.pathname === '/'} logo={logoV2} storeName={storeName} />
        <nav className="flex-auto self-center">
          <ul className="flex flex-row gap-4 items-center justify-center">
            {menuItems.map((menuItem) => (
              // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
              <li
                key={menuItem.path}
                onMouseOut={handleMouseOut}
                onMouseOver={() => handleMouseOver(menuItem)}
              >
                <Link
                  className="p-3 font-semibold block"
                  href={menuItem.path}
                  {...(menuItem.children &&
                  menuItem.children.length > 0 &&
                  currentMenuItem === menuItem
                    ? { 'aria-expanded': 'true' }
                    : { 'aria-expanded': 'false' })}
                >
                  {menuItem.name}
                </Link>
                {menuItem.children && menuItem.children.length > 0 ? (
                  <ul
                    className={`${
                      currentMenuItem === menuItem ? 'flex' : 'hidden'
                    } absolute w-full top-full left-0 bg-white shadow-lg z-10 p-8 flex-row flex-wrap justify-center gap-4`}
                  >
                    {menuItem.children.map((child) => (
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
      </div>
    </header>
  );
};
