import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '~/components/link';
import React from 'react';

interface AccountDropdownMenuProps {
  accountHref: string;
  accountLabel?: string;
}

export const AccountDropdownMenu: React.FC<AccountDropdownMenuProps> = ({
  accountHref,
  accountLabel = 'Account',
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            'flex items-center gap-1',
            'relative rounded-lg bg-[var(--nav-button-background,transparent)] p-1.5 text-[var(--nav-button-icon,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:outline-0 focus-visible:ring-2',
          )}
          aria-label={accountLabel}
        >
          <User size={20} strokeWidth={1} className="mr-1 inline" />
          <span>{accountLabel}</span>
          <ChevronDown size={18} strokeWidth={1.5} className="ml-1" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-[180px] rounded-xl bg-[var(--nav-menu-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={8}
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/account/orders"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] hover:bg-[var(--nav-link-background-hover,hsl(var(--contrast-100)))]"
            >
              Orders
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/account/settings"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] hover:bg-[var(--nav-link-background-hover,hsl(var(--contrast-100)))]"
            >
              Account Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/account/wishlists"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] hover:bg-[var(--nav-link-background-hover,hsl(var(--contrast-100)))]"
            >
              Wishlists
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--nav-menu-border,hsl(var(--foreground)/5%))]" />
          <DropdownMenu.Item asChild>
            <Link
              href="/logout"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
