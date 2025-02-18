'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReactNode, useState } from 'react';

import { Link as CustomLink } from '~/components/link';

import { Button } from '../button';
import { BcImage } from '~/components/bc-image';

import callIcon from '~/public/home/callIcon.svg';
import messageIcon from '~/public/home/messageIcon.svg';

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
  items: Array<Link | Action | string>;
  trigger: ReactNode;
  getCustomerData: {
    user: {
      name: string;
      email: string;
      customerGroupId: string;
    };
    expires: string;
    customerAccessToken: string;
  } | null;
}

const Dropdown = ({
  align = 'center',
  className,
  items,
  trigger,
  getCustomerData,
  from,
}: Props) => {
  const [isOpen, setIsOpen] = useState('');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild className={className}>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className="z-50 flex !w-[200px] flex-col gap-[9px] rounded-[3px] border border-[#e7f5f8] bg-white p-5 text-base shadow-[0px_4px_4px_rgba(0,0,0,0.25)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={4}
        >
          {getCustomerData && from === 'account-dropdown' && (
            <DropdownMenu.Item>
              <CustomLink
                className="block whitespace-nowrap break-words font-medium text-[#03465c]"
                href="/account"
              >
                <span className="block w-full whitespace-normal break-words">
                  Hi, {getCustomerData?.user?.name}
                </span>
              </CustomLink>
            </DropdownMenu.Item>
          )}
          {items.map((item, index) =>
            'href' in item ? (
              <DropdownMenu.Item asChild key={`${item.href}-${index}`}>
                <CustomLink
                  className={item?.classNameCss ? item?.classNameCss : 'block whitespace-nowrap'}
                  href={item.href}
                >
                  {item.label}
                </CustomLink>
              </DropdownMenu.Item>
            ) : (
              // text-left leading-[32px] tracking-[0.5px] block whitespace-nowrap p-3 hover:focus-visible:ring-0
              <DropdownMenu.Item
                asChild
                key={item.name}
                className="[&_button.Logout-label]:justify-start [&_button.Logout-label]:whitespace-nowrap [&_button.Logout-label]:font-medium [&_button.Logout-label]:leading-[32px] [&_button.Logout-label]:tracking-[0.5px] [&_button.Logout-label]:text-[#008BB7]"
              >
                <form action={item.action} className="">
                  <Button
                    className="Logout-label block p-0 text-left text-[14px] font-[600] underline hover:bg-transparent hover:text-primary"
                    type="submit"
                    variant="subtle"
                  >
                    {item.name}
                  </Button>
                </form>
              </DropdownMenu.Item>
            ),
          )}
          {from === 'support' && (
            <>
              {/* <DropdownMenu.Item onClick={()=>setIsOpen('isOpen')} className={`${isOpen ? 'hidden' : 'block'}`} onSelect={(e) => e.preventDefault()}>
              <div
                  className="mt-[9px] block text-[14px] font-normal leading-[10px] tracking-[0.25px] text-[#008BB7] underline cursor-pointer"
                >
                  Contact
                </div>
              </DropdownMenu.Item> */}

              <div className={`flex flex-col gap-[9px]`}>
                <DropdownMenu.Item className="mt-[9px]">
                  <CustomLink
                    href="/support/contact"
                    className="block text-[14px] font-normal leading-[10px] tracking-[0.25px]"
                  >
                    <div>
                      <div className="flex flex-row items-center gap-[10px]">
                        <BcImage
                          src={callIcon}
                          alt="tel"
                          width={14}
                          height={14}
                          unoptimized={true}
                        />
                        <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#008bb7]">
                          Call an Agent
                        </div>
                      </div>
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                        Mon-Fri 6am-5pm PST
                      </div>
                    </div>
                  </CustomLink>
                </DropdownMenu.Item>

                <DropdownMenu.Item>
                  <CustomLink
                    href="/support/contact"
                    className="mt-[9px] block text-[14px] font-normal leading-[10px] tracking-[0.25px] text-[#353535]"
                  >
                    <div>
                      <div className="flex flex-row items-center gap-[10px]">
                        <BcImage
                          src={messageIcon}
                          alt="tel"
                          width={14}
                          height={14}
                          unoptimized={true}
                        />
                        <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#008bb7]">
                          Online Chat
                        </div>
                      </div>
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                        Sat-Sun 6am-3pm PST
                      </div>
                    </div>
                  </CustomLink>
                </DropdownMenu.Item>
              </div>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export { Dropdown };
