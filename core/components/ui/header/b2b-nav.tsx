'use client';
import { useEffect, useState } from 'react';
import { Dropdown } from '../dropdown';
import { logout } from '~/components/header/_actions/logout';

interface B2bNavProps {
  triggerButton: React.ReactNode;
}

export default function B2bNav({ triggerButton }: B2bNavProps) {
  const [b2bLinks, setB2bLinks] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.b2b?.utils?.user) {
        const routes = window.b2b.utils.user.getAllowedRoutes();
        setB2bLinks([...routes, { action: logout, name: 'Logout', isMenuItem: true }]);
        clearInterval(interval);
      }
    }, 500);
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
