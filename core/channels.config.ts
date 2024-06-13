import { locales } from './i18n';

type localesKeys = (typeof locales)[number];

type RecordFromLocales = {
  [K in localesKeys]: string;
};

// Set overrides per locale
const localeToChannelsMappings: Partial<RecordFromLocales> = {
  es: process.env.BIGCOMMERCE_CHANNEL_ID,
};

export default localeToChannelsMappings;
