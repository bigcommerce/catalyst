import { ReactNode } from 'react';

import { AccountLayoutLink } from './account-layout-link';

type Props = {
  links: Array<{
    href: string;
    label: string;
  }>;
  children: ReactNode;
};

export function AccountLayout({ links, children }: Props) {
  return (
    <div className="flex justify-center @container">
      <div className="relative flex w-full gap-12 px-12 py-12 @5xl:max-w-7xl">
        <nav className="basis-48">
          <ul className="sticky top-12">
            {links.map((link, index) => (
              <li key={index}>
                <AccountLayoutLink href={link.href}>{link.label}</AccountLayoutLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
