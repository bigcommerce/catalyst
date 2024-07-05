import { getLocale } from 'next-intl/server';

import { localeLanguageRegionMap, locales, LocaleType } from '~/i18n';

import { Link } from '../link';

export const Locale = async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const locale = (await getLocale()) as LocaleType;

  return (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    locales.length > 1 && (
      <Link className="flex gap-2" href="/store-selector">
        <span>{localeLanguageRegionMap[locale].flag}</span>
        <span>{localeLanguageRegionMap[locale].region}</span>
      </Link>
    )
  );
};
