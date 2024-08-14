import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

enum LocalePrefixes {
  ALWAYS = 'always',
  NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

// Enable locales by including them here.
// List includes locales with existing messages support.
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

interface LocaleEntry {
  id: LocaleType;
  language: string;
  region: string;
  flag: string;
}

/**
 * Custom map of locale to language and region.
 * Temporary solution until we have a better way to include regions for all locales.
 */
export const localeLanguageRegionMap: LocaleEntry[] = [
  { id: 'en', language: 'English', region: 'United States', flag: '🇺🇸' },
  // { id: 'da', language: 'Dansk', region: 'Danmark', flag: '🇩🇰' },
  // { id: 'es-419', language: 'Español', region: 'America Latina', flag: '' },
  // { id: 'es-AR', language: 'Español', region: 'Argentina', flag: '🇦🇷' },
  // { id: 'es-CL', language: 'Español', region: 'Chile', flag: '🇨🇱' },
  // { id: 'es-CO', language: 'Español', region: 'Colombia', flag: '🇨🇴' },
  // { id: 'es-LA', language: 'Español', region: 'America Latina', flag: '' },
  // { id: 'es-MX', language: 'Español', region: 'México', flag: '🇲🇽' },
  // { id: 'es-PE', language: 'Español', region: 'Perú', flag: '🇵🇪' },
  // { id: 'es', language: 'Español', region: 'España', flag: '🇪🇸' },
  // { id: 'it', language: 'Italiano', region: 'Italia', flag: '🇮🇹' },
  // { id: 'nl', language: 'Nederlands', region: 'Nederland', flag: '🇳🇱' },
  // { id: 'pl', language: 'Polski', region: 'Polska', flag: '🇵🇱' },
  // { id: 'pt', language: 'Português', region: 'Portugal', flag: '🇵🇹' },
  // { id: 'de', language: 'Deutsch', region: 'Deutschland', flag: '🇩🇪' },
  // { id: 'fr', language: 'Français', region: 'France', flag: '🇫🇷' },
  // { id: 'ja', language: '日本語', region: '日本', flag: '🇯🇵' },
  // { id: 'no', language: 'Norsk', region: 'Norge', flag: '🇳🇴' },
  // { id: 'pt-BR', language: 'Português', region: 'Brasil', flag: '🇧🇷' },
  // { id: 'sv', language: 'Svenska', region: 'Sverige', flag: '🇸🇪' },
];

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
