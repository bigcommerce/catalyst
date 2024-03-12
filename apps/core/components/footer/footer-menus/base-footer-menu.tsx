import React, { ComponentPropsWithoutRef } from 'react';

import { Link } from '~/components/link';

interface Item {
  name: string;
  path: string;
}

interface Props {
  title: string;
  items: Item[];
}

export const BaseFooterMenu = ({
  title,
  items,
  ...props
}: Props & ComponentPropsWithoutRef<'div'>) => {
  return (
    <div {...props}>
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.path}>
            <Link href={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
