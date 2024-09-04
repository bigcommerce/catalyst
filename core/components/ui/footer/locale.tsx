import { getLocale } from 'next-intl/server';

import { localeLanguageRegionMap, locales } from '~/i18n/routing';

import { Link as CustomLink } from '../../link';

export const Locale = async () => {
  const locale = await getLocale();

  const selectedLocale = localeLanguageRegionMap.find(({ id }) => id === locale);

  if (!selectedLocale) {
    return null;
  }

  return (
    Object.keys(locales).length > 1 && (
      <CustomLink className="flex gap-2" href="/store-selector">
        <span>{selectedLocale.flag}</span>
        <span>{selectedLocale.region}</span>
      </CustomLink>
    )
  );
};
