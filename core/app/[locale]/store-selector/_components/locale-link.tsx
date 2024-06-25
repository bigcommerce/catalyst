import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';
import { cn } from '~/lib/utils';

type LocaleLanguageRegionMap = {
  [key in LocaleType]: { language: string; region: string; flag: string };
};

/**
 * Custom map of locale to language and region
 * Temporary solution until we have a better way to include regions for all locales
 */
const localeLanguageRegionMap: LocaleLanguageRegionMap = {
  da: { language: 'Dansk', region: 'Danmark', flag: '🇩🇰' },
  en: { language: 'English', region: 'United States', flag: '🇺🇸' },
  'es-419': { language: 'Español', region: 'America Latina', flag: '' },
  'es-AR': { language: 'Español', region: 'Argentina', flag: '🇦🇷' },
  'es-CL': { language: 'Español', region: 'Chile', flag: '🇨🇱' },
  'es-CO': { language: 'Español', region: 'Colombia', flag: '🇨🇴' },
  'es-LA': { language: 'Español', region: 'America Latina', flag: '' },
  'es-MX': { language: 'Español', region: 'México', flag: '🇲🇽' },
  'es-PE': { language: 'Español', region: 'Perú', flag: '🇵🇪' },
  es: { language: 'Español', region: 'España', flag: '🇪🇸' },
  it: { language: 'Italiano', region: 'Italia', flag: '🇮🇹' },
  nl: { language: 'Nederlands', region: 'Nederland', flag: '🇳🇱' },
  pl: { language: 'Polski', region: 'Polska', flag: '🇵🇱' },
  pt: { language: 'Português', region: 'Portugal', flag: '🇵🇹' },
  de: { language: 'Deutsch', region: 'Deutschland', flag: '🇩🇪' },
  fr: { language: 'Français', region: 'France', flag: '🇫🇷' },
  ja: { language: '日本語', region: '日本', flag: '🇯🇵' },
  no: { language: 'Norsk', region: 'Norge', flag: '🇳🇴' },
  'pt-BR': { language: 'Português', region: 'Brasil', flag: '🇧🇷' },
  sv: { language: 'Svenska', region: 'Sverige', flag: '🇸🇪' },
};

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
