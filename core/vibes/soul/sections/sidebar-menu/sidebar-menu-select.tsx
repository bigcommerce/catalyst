'use client';

import { Select } from '@/vibes/soul/primitives/select';
import { usePathname, useRouter } from '~/i18n/routing';

export function SidebarMenuSelect({ links }: { links: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      onValueChange={(value) => {
        router.push(value);
      }}
      options={links.map((link) => ({ value: link.href, label: link.label }))}
      position="popper"
      value={pathname}
    />
  );
}
