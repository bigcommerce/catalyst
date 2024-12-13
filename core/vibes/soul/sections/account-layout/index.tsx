import { ReactNode } from 'react';

import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

import { AccountLayoutLink } from './account-layout-link';
import { AccountLayoutLinkSelect } from './account-layout-link-select';

interface Props {
  links: Array<{
    href: string;
    label: string;
  }>;
  children: ReactNode;
}

export function AccountLayout({ links, children }: Props) {
  return (
    <StickySidebarLayout
      sidebar={
        <nav>
          <ul className="hidden @2xl:block">
            {links.map((link, index) => (
              <li key={index}>
                <AccountLayoutLink href={link.href}>{link.label}</AccountLayoutLink>
              </li>
            ))}
          </ul>
          <div className="@2xl:hidden">
            <AccountLayoutLinkSelect links={links} />
          </div>
        </nav>
      }
      sidebarSize="small"
    >
      {children}
    </StickySidebarLayout>
  );
}
