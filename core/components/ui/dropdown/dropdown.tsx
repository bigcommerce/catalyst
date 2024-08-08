import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Link } from '~/components/link';

import { Button } from '../button';

interface Props extends ComponentPropsWithoutRef<typeof DropdownMenu.Root> {
  align?: 'start' | 'center' | 'end';
  className?: string;
  items: Array<{ path: string; name: string } | { action: () => Promise<void>; name: string }>;
  sideOffset?: number;
  trigger: ReactNode;
}

const Dropdown = ({ align = 'center', className, items, sideOffset = 4, trigger }: Props) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild className={className}>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className="z-50 bg-white p-4 text-base shadow-md outline-none hover:focus-visible:ring-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={sideOffset}
        >
          {items.map((item) =>
            'path' in item ? (
              <DropdownMenu.Item asChild key={item.path}>
                <Link
                  className="block whitespace-nowrap p-3 hover:focus-visible:ring-0"
                  href={item.path}
                >
                  {item.name}
                </Link>
              </DropdownMenu.Item>
            ) : (
              <form action={item.action} key={item.name}>
                <DropdownMenu.Item asChild>
                  <Button
                    className="justify-start p-3 hover:bg-transparent hover:text-primary hover:focus-visible:ring-0"
                    type="submit"
                    variant="subtle"
                  >
                    {item.name}
                  </Button>
                </DropdownMenu.Item>
              </form>
            ),
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export { Dropdown };
