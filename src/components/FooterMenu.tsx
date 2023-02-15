import React from 'react';

import { Link } from '../../reactant/components/Link';

interface FooterMenuProps {
  title: string;
  items: Array<{
    name: string;
    path: string;
  }>;
}

export const FooterMenu = ({ title, items }: FooterMenuProps) => (
  <>
    <h4 className="font-bold mb-4">{title}</h4>
    <ul>
      {items.map((item) => (
        <li className="mb-4" key={item.path}>
          <Link className={Link.text.className} href={item.path}>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </>
);
