import clsx from 'clsx';
import { Suspense } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

import { Link } from '~/components/link';

export type MenuItem = {
  id: string;
  title?: string;
  url?: string;
};

type Props = {
  menuItems: Streamable<MenuItem[]>;
  classNames?: {
    root?: string;
    content?: string;
    item?: string;
  };
  emptyStateMessage?: string;
};

export function MegaMenu({
  menuItems: streamableMenuItems,
  classNames,
  emptyStateMessage = 'No menu items found',
}: Props) {
  return (
    <Suspense fallback={<MegaMenuSkeleton classNames={classNames} message={emptyStateMessage} />}>
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
