import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

enum LocalePrefixes {
  ALWAYS = 'always',
  NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

// Enable locales by including them here
// List includes locales with existing messages support
const locales = [
  'en',
  // 'da',
  // 'es-419',
  // 'es-AR',
  // 'es-CL',
  // 'es-CO',
  // 'es-LA',
  // 'es-MX',
  // 'es-PE',
  // 'es',
  // 'it',
  // 'nl',
  // 'pl',
  // 'pt',
  // 'de',
  // 'fr',
  // 'ja',
  // 'no',
  // 'pt-BR',
  // 'sv',
] as const;

type LocaleLanguageRegionMap = {
  [key in LocaleType]: { language: string; region: string; flag: string };
};

/**
 * Custom map of locale to language and region
 * Temporary solution until we have a better way to include regions for all locales
 */
export const localeLanguageRegionMap: LocaleLanguageRegionMap = {
  en: { language: 'English', region: 'United States', flag: '🇺🇸' },
  // da: { language: 'Dansk', region: 'Danmark', flag: '🇩🇰' }
  // 'es-419': { language: 'Español', region: 'America Latina', flag: '' },
  // 'es-AR': { language: 'Español', region: 'Argentina', flag: '🇦🇷' },
  // 'es-CL': { language: 'Español', region: 'Chile', flag: '🇨🇱' },
  // 'es-CO': { language: 'Español', region: 'Colombia', flag: '🇨🇴' },
  // 'es-LA': { language: 'Español', region: 'America Latina', flag: '' },
  // 'es-MX': { language: 'Español', region: 'México', flag: '🇲🇽' },
  // 'es-PE': { language: 'Español', region: 'Perú', flag: '🇵🇪' },
  // es: { language: 'Español', region: 'España', flag: '🇪🇸' },
  // it: { language: 'Italiano', region: 'Italia', flag: '🇮🇹' },
  // nl: { language: 'Nederlands', region: 'Nederland', flag: '🇳🇱' },
  // pl: { language: 'Polski', region: 'Polska', flag: '🇵🇱' },
  // pt: { language: 'Português', region: 'Portugal', flag: '🇵🇹' },
  // de: { language: 'Deutsch', region: 'Deutschland', flag: '🇩🇪' },
  // fr: { language: 'Français', region: 'France', flag: '🇫🇷' },
  // ja: { language: '日本語', region: '日本', flag: '🇯🇵' },
  // no: { language: 'Norsk', region: 'Norge', flag: '🇳🇴' },
  // 'pt-BR': { language: 'Português', region: 'Brasil', flag: '🇧🇷' },
  // sv: { language: 'Svenska', region: 'Sverige', flag: '🇸🇪' },
};

type LocalePrefixesType = `${LocalePrefixes}`;

// Temporary we use NEVER prefix to prioritize accept-language header
// & disable internationalized routes due to incomplete multilingual implementation
const localePrefix: LocalePrefixesType = LocalePrefixes.NEVER;
const defaultLocale = 'en';

type LocaleType = (typeof locales)[number];

export default getRequestConfig(async (params) => {
  let lang = params.locale as LocaleType; // eslint-disable-line

  if (!locales.includes(lang)) notFound();

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    messages: await import(`./messages/${lang}`),
  };
});

export { LocalePrefixes, locales, localePrefix, defaultLocale };
export type { LocaleType };
