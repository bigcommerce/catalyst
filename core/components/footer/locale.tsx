import { Globe } from 'lucide-react';
import { getLocale } from 'next-intl/server';

import { locales } from '~/i18n';

import { Link } from '../link';

export const Locale = async () => {
  const locale = await getLocale();

  return (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    locales.length > 1 && (
      <Link className="flex gap-2" href="/store-selector">
        <Globe /> {locale.toUpperCase()}
      </Link>
    )
  );
};
