'use client';

import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';
import { useState } from 'react';

interface PopOverProps {
  children: React.ReactNode;
  popOverContents?: { key: string; label: string }[];
  from?: string;
  hrefLink?: string;
}

export default function PopOverClick({ hrefLink, from, children, popOverContents }: PopOverProps) {
  console.log(hrefLink, 'This is href link');
  return (
    <div className="relative">
      <Popover.Root>
        <Popover.Trigger asChild>{children}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={5}
            className="z-50 rounded-md border bg-white shadow-lg [&_.rdp-caption\\_dropdowns>div]:cursor-pointer"
          >
            <ul className="absolute right-full w-max min-w-[120px] list-none rounded-[5px] bg-white text-left shadow-[0px_0px_5px_rgba(0,0,0,0.2)] [&_li]:cursor-pointer [&_li]:p-[5px_15px] hover:[&_li]:rounded-[5px] hover:[&_li]:bg-[#ededed]">
              {from === 'quote' &&
                popOverContents?.map((popOverContent: any,index) => (
                  <Link key={index} href={`${hrefLink}` || ''} onClick={()=>{localStorage.setItem('QoutepageType',popOverContent.key)}}>
                    <li key={popOverContent.key}>{popOverContent.label}</li>
                  </Link>
                ))}

              {from === 'edit' &&
                popOverContents?.map((popOverContent: any, index) => (
                  <Link key={index} href={`${hrefLink}` || ''}>
                    <li key={popOverContent.key}>{popOverContent.label}</li>
                  </Link>
                ))}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
