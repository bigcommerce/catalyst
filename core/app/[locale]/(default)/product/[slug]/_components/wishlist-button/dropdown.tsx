'use client';

import { clsx } from 'clsx';
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { DropdownMenu, DropdownMenuItem } from '@/vibes/soul/primitives/dropdown-menu';
import { usePathname, useRouter } from '~/i18n/routing';

import { WishlistButtonWishlistInfo } from '.';

interface Props extends React.PropsWithChildren {
  formId: string;
  newWishlistLabel: string;
  wishlists: WishlistButtonWishlistInfo[];
  isLoggedIn: boolean;
}

export const WishlistButtonDropdown = ({
  formId,
  newWishlistLabel,
  wishlists,
  isLoggedIn,
  children,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToNewWishlistAction = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('action', 'addToNewWishlist');

    const path = params.size === 0 ? pathname : `${pathname}?${params.toString()}`;

    if (isLoggedIn) {
      router.push(path);
    } else {
      const loginParams = new URLSearchParams({ redirectTo: path });

      router.push(`/login?${loginParams.toString()}`);
    }
  };

  const items: DropdownMenuItem[] = wishlists.map(
    ({ entityId: wishlistId, name, wishlistItemId }) => ({
      label: (
        <button
          className="group block w-full text-left"
          form={formId}
          name="menuItem"
          type="submit"
          value={JSON.stringify({
            wishlistId,
            wishlistItemId,
            action: wishlistItemId ? 'remove' : 'add',
            redirectTo:
              searchParams.size === 0 ? pathname : `${pathname}?${searchParams.toString()}`,
          })}
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'flex-1 overflow-hidden text-ellipsis',
                wishlistItemId ? 'font-bold' : '',
              )}
            >
              {name}
            </div>
            {wishlistItemId !== undefined && (
              <div>
                <CheckIcon className="group-hover:hidden" size={16} />
                <XIcon className="hidden group-hover:block" size={16} />
              </div>
            )}
          </div>
        </button>
      ),
    }),
  );

  return (
    <DropdownMenu
      align="start"
      className="text-nowrap"
      items={[
        {
          label: (
            <div className="flex items-center gap-2">
              <PlusIcon size={20} />
              <span>{newWishlistLabel}</span>
            </div>
          ),
          action: addToNewWishlistAction,
        },
        'separator',
        ...items,
      ]}
    >
      <div>{children}</div>
    </DropdownMenu>
  );
};
