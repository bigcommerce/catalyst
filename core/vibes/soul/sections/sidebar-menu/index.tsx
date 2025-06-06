import { ComponentPropsWithoutRef } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';

import { SidebarMenuLink } from './sidebar-menu-link';
import { SidebarMenuSelect } from './sidebar-menu-select';

interface MenuLink {
  href: string;
  label: string;
  prefetch?: ComponentPropsWithoutRef<typeof SidebarMenuLink>['prefetch'];
}

interface Props {
  links: Streamable<MenuLink[]>;
  placeholderCount?: number;
}

export function SidebarMenu({ links: streamableLinks, placeholderCount = 5 }: Props) {
  return (
    <Stream
      fallback={<SidebarMenuSkeleton placeholderCount={placeholderCount} />}
      value={streamableLinks}
    >
      {(links) => {
        if (!links.length) {
          return null;
        }

        return (
          <nav>
            <ul className="hidden @2xl:block">
              {links.map((link, index) => (
                <li key={index}>
                  <SidebarMenuLink href={link.href} prefetch={link.prefetch}>
                    {link.label}
                  </SidebarMenuLink>
                </li>
              ))}
            </ul>
            <div className="@2xl:hidden">
              <SidebarMenuSelect links={links} />
            </div>
          </nav>
        );
      }}
    </Stream>
  );
}

function SidebarMenuSkeleton({ placeholderCount }: { placeholderCount: number }) {
  return (
    <>
      <div className="hidden [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @2xl:block">
        <div className="w-full animate-pulse">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div className="flex h-10 items-center px-3" key={index}>
              <div className="h-[1lh] flex-1 rounded-lg bg-contrast-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="@2xl:hidden">
        <div className="h-[50px] w-full rounded-lg bg-contrast-100" />
      </div>
    </>
  );
}
