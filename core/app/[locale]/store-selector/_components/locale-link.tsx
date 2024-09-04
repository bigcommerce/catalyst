import { Link } from '~/components/link';
import { localeLanguageRegionMap, LocaleType } from '~/i18n/routing';
import { cn } from '~/lib/utils';

export const LocaleLink = ({ locale, selected }: { locale: string; selected: boolean }) => {
  const selectedLocale = localeLanguageRegionMap.find(({ id }) => id === locale);

  if (!selectedLocale) {
    return null;
  }

  return (
    <Link
      className={cn(
        'border border-gray-200 px-3 py-2 text-xs hover:bg-gray-100 hover:text-black',
        selected && 'border-black',
      )}
      href="/"
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      locale={locale as LocaleType}
    >
      <div className="flex h-full items-center gap-2">
        <div className="text-2xl">{selectedLocale.flag}</div>
        <div className="flex flex-col gap-1">
          <span className="font-bold">{selectedLocale.language}</span>
          <span>{selectedLocale.region}</span>
        </div>
      </div>
    </Link>
  );
};
