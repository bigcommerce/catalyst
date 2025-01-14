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
/*
export type MenuItem = {
  id: string;
  title?: string;
  url?: string;
};
*/
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
    content?: string;
    item?: string;
  };
  emptyStateMessage?: string;
};

export function MegaMenu({
  variant,
  //menuItems: streamableMenuItems,
  //secondaryMenuItems: streamableSecondaryMenuItems,
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
      <div>{variant}</div>
      <ul>
      {menuItems.map((menuItem: MenuItem, index: number) => (
        <li className={clsx(classNames?.item)} key={index}>
          <Link href={menuItem.link?.href || ''}>{menuItem.title}</Link>
        </li>
      ))}
      </ul>
      <ul>
      {secondaryMenuItems.map((menuItem: SecondaryMenuItem, index: number) => (
        <li className={clsx(classNames?.item)} key={index}>
          <Link href={menuItem.link?.href || ''}>{menuItem.title}</Link>
        </li>
      ))}
      </ul>
      </>
    </Suspense>
  );
}

export function MegaMenuSkeleton({
  classNames,
  message,
  count = 8,
}: {
  classNames?: {
    root?: string;
    content?: string;
    item?: string;
  };
  message?: string;
  count?: number;
}) {
  return <></>;
  //return <div>{message}</div>;
}
