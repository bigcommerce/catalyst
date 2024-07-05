import { Link } from '~/components/link';
import { localeLanguageRegionMap, LocaleType } from '~/i18n';
import { cn } from '~/lib/utils';

export const LocaleLink = ({ locale, selected }: { locale: LocaleType; selected: boolean }) => {
  return (
    <Link
      className={cn(
        'border border-gray-200 px-3 py-2 text-xs hover:bg-gray-100 hover:text-black',
        selected && 'border-black',
      )}
      href="/"
      locale={locale}
    >
      <div className="flex h-full items-center gap-2">
        <div className="text-2xl">{localeLanguageRegionMap[locale].flag}</div>
        <div className="flex flex-col gap-1">
          <span className="font-bold">{localeLanguageRegionMap[locale].language}</span>
          <span>{localeLanguageRegionMap[locale].region}</span>
        </div>
      </div>
    </Link>
  );
};
