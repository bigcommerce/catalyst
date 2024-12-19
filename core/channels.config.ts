// Set overrides per locale
const localeToChannelsMappings: Record<string, string> = {
  fr: '1685086',
};

function getChannelIdFromLocale(locale = '') {
  return localeToChannelsMappings[locale] ?? process.env.BIGCOMMERCE_CHANNEL_ID;
}

export { getChannelIdFromLocale };
