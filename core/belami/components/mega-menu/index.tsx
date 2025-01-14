import clsx from 'clsx';
import { Suspense } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

import { Link } from '~/components/link';

interface MenuItem {
  title?: string;
  link?: { href?: string; target?: string };
  subMenuItems: SubMenuItem[];
}

interface SubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  subSubMenuItems: SubSubMenuItem[];
}

interface SubSubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

interface SecondaryMenuItem {
  title?: string;
  link?: { href?: string; target?: string };
}

type Props = {
  variant?: string;
  /*
  menuItems: Streamable<MenuItem[]>;
  secondaryMenuItems: Streamable<SecondaryMenuItem[]>;
  */
  menuItems: MenuItem[];
  secondaryMenuItems: SecondaryMenuItem[];
  classNames?: {
    root?: string;
    mainMenu?: string;
    secondaryMenu?: string;
    mainMenuItem?: string;
    mainSubMenuItem?: string;
    mainSubSubMenuItem?: string;
    secondaryMenuItem?: string;
    mainMenuLink?: string;
    mainSubMenuLink?: string;
    mainSubSubMenuLink?: string;
    secondaryMenuLink?: string;
  };
  emptyStateMessage?: string;
};

export function MegaMenu({
  variant,
  /*
  menuItems: streamableMenuItems,
  secondaryMenuItems: streamableSecondaryMenuItems,
  */
  menuItems,
  secondaryMenuItems,
  classNames,
  emptyStateMessage = 'No menu items found',
}: Props) {
  return (
    <Suspense fallback={<MegaMenuSkeleton classNames={classNames} message={emptyStateMessage} />}>
      {/*
      {mapStreamable(streamableMenuItems, (menuItems) => {
        if (menuItems.length === 0) {
          return <MegaMenuSkeleton classNames={classNames} message={emptyStateMessage} />;
        }

        return (
          <ul>
            {menuItems.map((menuItem) => (
              <li className={clsx(classNames?.item)} key={menuItem.id}>
                <Link href={menuItem.url || ''}>{menuItem.title}</Link>
              </li>
            ))}
          </ul>
        );
      })}
      */}

      <>
        {(variant === 'default') &&
          <div className={clsx('header-bottom navigation', variant, classNames?.root)}>
            {/* {mapStreamable(streamableMenuItems, (menuItems) => { */}
            {(menuItems && menuItems.length > 0) &&
              <nav className={clsx('main-menu', classNames?.mainMenu)}>
                <ul>
                {menuItems.map((menuItem: MenuItem, index: number) => (
                  <li className={clsx('main-menu-item', classNames?.mainMenuItem)} key={index}>
                    {(menuItem.link?.href)
                      ? <Link href={menuItem.link.href} className={clsx('main-menu-link', classNames?.mainMenuLink)}>{menuItem.title}</Link>
                      : <span className={clsx('main-menu-link', classNames?.mainMenuLink)}>{menuItem.title}</span>
                    }
                  </li>
                ))}
                </ul>
              </nav>
            }
            {/* }})} */}
            {/* {mapStreamable(streamableSecondaryMenuItems, (secondaryMenuItems) => { */}
            {(secondaryMenuItems && secondaryMenuItems.length > 0) &&
              <nav className={clsx('secondary-menu', classNames?.secondaryMenu)}>
                <ul>
                {secondaryMenuItems.map((menuItem: SecondaryMenuItem, index: number) => (
                  <li className={clsx('secondary-menu-item', classNames?.secondaryMenuItem)} key={index}>
                    {(menuItem.link?.href)
                      ? <Link href={menuItem.link.href} className={clsx('secondary-menu-link', classNames?.secondaryMenuLink)}>{menuItem.title}</Link>
                      : <span className={clsx('secondary-menu-link', classNames?.secondaryMenuLink)}>{menuItem.title}</span>
                    }
                  </li>
                ))}
                </ul>
              </nav>
            }
            {/* }})} */}
          </div>
        }
      </>
    </Suspense>
  );
}

export function MegaMenuSkeleton({
  classNames,
  message
}: {
  classNames?: {
    root?: string;
    content?: string;
    item?: string;
  };
  message?: string;
}) {
  return <></>;
  //return <div>{message}</div>;
}
