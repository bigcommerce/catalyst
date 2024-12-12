'use client';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '../button';
import { Dropdown } from '../dropdown';
import { logout } from '~/components/header/_actions/logout';

export default function B2bNav() {
  const [b2bLinks, setB2bLinks] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.b2b?.utils?.user) {
        const routes = window.b2b.utils.user.getAllowedRoutes();
        setB2bLinks([...routes, { action: logout, name: 'Logout', isMenuItem: true }]);
        console.log(routes)
        clearInterval(interval);
      }
    }, 500);
  }, []);

  const items = b2bLinks.filter((link) => link.isMenuItem).map((link) => link.path ? ({
    href: `/#${link.path}`,
    label: link.name,
  }) : ({
    name: link.name,
    action: link.action
   }));

  return (
        <Dropdown   
        items={items}
        trigger={
        <Button
            aria-label={('Account.account')}
            className="p-3 text-black hover:bg-transparent hover:text-primary"
            variant="subtle"
        >
            <User>
            <title>{('Account.account')}</title>
            </User>
        </Button>
        }
    />
  );
}
