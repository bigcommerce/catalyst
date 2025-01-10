'use client';

import { useEffect, useState } from 'react';

import { logout } from '~/components/header/_actions/logout';

import { Dropdown } from '../dropdown';

interface B2bNavProps {
  triggerButton: React.ReactNode;
}

const action = { action: logout, name: 'Logout', isMenuItem: true };

export default function B2bNav({ triggerButton }: B2bNavProps) {
  const [b2bLinks, setB2bLinks] = useState<any[]>([action]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.b2b?.utils) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const routes = window.b2b.utils.getRoutes() || [];

        setB2bLinks([...routes, action]);

        if (routes.length) {
          clearInterval(interval);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const items = b2bLinks
    .filter((link) => link.isMenuItem)
    .map((link) =>
      link.path
        ? {
            href: `/#${link.path}`,
            label: link.name,
          }
        : {
            name: link.name,
            action: link.action,
          },
    );

  return <Dropdown items={items} trigger={triggerButton} />;
}
