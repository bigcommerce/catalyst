'use client';

import { Select } from '@/vibes/soul/form/select';
import { usePathname, useRouter } from '~/i18n/routing';

export function AccountLayoutLinkSelect({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      name="account-layout-link-select"
      onValueChange={(value) => {
        router.push(value);
      }}
      options={links.map((link) => ({ value: link.href, label: link.label }))}
      value={pathname}
    />
  );
}
