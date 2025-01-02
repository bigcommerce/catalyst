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
  getCustomerData: {
    user: {
      name: string;
      email: string;
    };
    expires: string;
    customerAccessToken: string;
  } | null;
}

const Dropdown = ({ align = 'center', className, items, trigger, getCustomerData }: Props) => {
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
          {getCustomerData && (
            <DropdownMenu.Item>
              <CustomLink
                className="block whitespace-nowrap font-medium p-3 text-[#03465c] hover:focus-visible:ring-0"
                href="/account"
              >
                Hi, {getCustomerData?.user?.name}
              </CustomLink>
            </DropdownMenu.Item>
          )}
          {items.map((item, index) =>
            'href' in item ? (
              <DropdownMenu.Item asChild key={`${item.href}-${index}`}>
                <CustomLink
                  className="block whitespace-nowrap p-3 hover:focus-visible:ring-0"
                  href={item.href}
                >
                  {item.label}
                </CustomLink>
              </DropdownMenu.Item>
            ) : (
              // text-left leading-[32px] tracking-[0.5px] block whitespace-nowrap p-3 hover:focus-visible:ring-0
              <DropdownMenu.Item asChild key={item.name} className='[&_button.Logout-label]:justify-start [&_button.Logout-label]:text-[#008BB7] [&_button.Logout-label]:font-medium [&_button.Logout-label]:leading-[32px] [&_button.Logout-label]:tracking-[0.5px] [&_button.Logout-label]:whitespace-nowrap'>
                <form action={item.action} className="hover:focus-visible:ring-0">
                  <Button
                    className="Logout-label underline justify-center p-3 hover:bg-transparent hover:text-primary"
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
