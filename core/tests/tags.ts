export const TAGS = {
  // @writes-data is used to mark tests that modify data on the storefront without directly using the API.
  writesData: '@writes-data',
  // @alternate-locale is used to mark tests that should be run with an alternate locale setting.
  alternateLocale: '@alternate-locale',
  // @no-trailing-slash is used to mark tests that should be run with TRAILING_SLASH disabled.
  noTrailingSlash: '@no-trailing-slash',
};
