import { locales } from './i18n';

export type LocalesKeys = (typeof locales)[number];

export type RecordFromLocales = {
  [K in LocalesKeys]: string;
};

// Set overrides per locale
const localeToChannelsMappings: Partial<RecordFromLocales> = {
  // es: '123456',
};

export default localeToChannelsMappings;
