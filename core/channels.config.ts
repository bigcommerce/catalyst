// Set overrides per locale
const localeToChannelsMappings: Record<string, string> = {
  // es: '12345',
};

function getChannelIdFromLocale(locale = '') {
  return localeToChannelsMappings[locale] ?? process.env.BIGCOMMERCE_CHANNEL_ID;
}

export { getChannelIdFromLocale };
