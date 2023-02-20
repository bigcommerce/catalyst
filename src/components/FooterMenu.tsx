import React from 'react';
import z from 'zod';

import { Link } from '../../reactant/components/Link';

const FooterMenuProps = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
    }),
  ),
});

export const FooterMenu = (props: z.infer<typeof FooterMenuProps>) => {
  const { title, items } = FooterMenuProps.parse(props);

  return (
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
};
