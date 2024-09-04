import { type LocaleType } from './i18n/routing';

export type RecordFromLocales = {
  [K in LocaleType]: string;
};

// Set overrides per locale
const localeToChannelsMappings: Partial<RecordFromLocales> = {
  // es: '12345',
};

function getChannelIdFromLocale(locale?: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return localeToChannelsMappings[locale as LocaleType] ?? process.env.BIGCOMMERCE_CHANNEL_ID;
}

export { getChannelIdFromLocale };
