import { Globe } from 'lucide-react';
import { getLocale } from 'next-intl/server';

import { Link } from '../link';

export const Locale = async () => {
  const locale = await getLocale();

  return (
    <Link className="flex gap-2" href="/store-selector">
      <Globe /> {locale.toUpperCase()}
    </Link>
  );
};
