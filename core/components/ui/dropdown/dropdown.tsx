import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';

import { Link as CustomLink } from '~/components/link';

import { Button } from '../button';

interface Link {
  href: string;
  label: string;
}

interface Action {
  action: () => Promise<void> | void;
  name: string;
}

interface Props {
  align?: 'start' | 'center' | 'end';
  className?: string;
  items: Array<Link | Action>;
  trigger: ReactNode;
}

const Dropdown = ({ align = 'center', className, items, trigger }: Props) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild className={className}>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className="z-50 bg-white p-4 text-base shadow-md outline-none hover:focus-visible:ring-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={4}
        >
          {items.map((item) =>
            'href' in item ? (
              <DropdownMenu.Item asChild key={item.href}>
                <CustomLink
                  className="block whitespace-nowrap p-3 hover:focus-visible:ring-0"
                  href={item.href}
                >
                  {item.label}
                </CustomLink>
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item asChild key={item.name}>
                <form action={item.action} className="hover:focus-visible:ring-0">
                  <Button
                    className="justify-start p-3 hover:bg-transparent hover:text-primary"
                    type="submit"
                    variant="subtle"
                  >
                    {item.name}
                  </Button>
                </form>
              </DropdownMenu.Item>
            ),
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export { Dropdown };
