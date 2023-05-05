import Link from 'next/link';
import React from 'react';

import { Link as ReactantLink } from '@reactant/components/Link';
import { H4, H6 } from '@reactant/components/Typography';

interface FooterMenuProps {
  title: string;
  items: Array<{
    name: string;
    path: string;
  }>;
}

export const FooterMenu = ({ title, items }: FooterMenuProps) => (
  <>
    <H4 className={`${H6.default.className} mb-4`}>{title}</H4>
    <ul>
      {items.map((item) => (
        <li className="mb-4" key={item.path}>
          <Link className={ReactantLink.text.className} href={item.path}>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </>
);
