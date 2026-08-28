import {
  deriveLocaleRouting,
  getLocalePrefix,
  LocaleNode,
  LocaleRouting,
} from '~/i18n/locale-routing';
import { testEnv } from '~/tests/environment';

const UNPREFIXED: LocaleRouting = {
  locales: [testEnv.TESTS_LOCALE],
  defaultLocale: testEnv.TESTS_LOCALE,
  prefixes: {},
  rootLocale: testEnv.TESTS_LOCALE,
};

const LocaleSettingsQuery = `
  query TestLocaleSettingsQuery {
    site {
      settings {
        locales {
          code
          isDefault
          path
        }
      }
    }
  }
`;

// Read from the store, the same source the storefront uses, rather than a build artifact.
const fetchLocaleRouting = async (): Promise<LocaleRouting> => {
  const { BIGCOMMERCE_STORE_HASH, BIGCOMMERCE_CHANNEL_ID, BIGCOMMERCE_STOREFRONT_TOKEN } = testEnv;

  if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_CHANNEL_ID || !BIGCOMMERCE_STOREFRONT_TOKEN) {
    // eslint-disable-next-line no-console
    console.warn(
      'Storefront credentials are unavailable, so locale-aware URL assertions will assume the test locale is served at "/".',
    );

    return UNPREFIXED;
  }

  const url = `https://store-${BIGCOMMERCE_STORE_HASH}-${BIGCOMMERCE_CHANNEL_ID}.${testEnv.BIGCOMMERCE_GRAPHQL_API_DOMAIN}/graphql`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BIGCOMMERCE_STOREFRONT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: LocaleSettingsQuery }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch locale settings: ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const body = (await response.json()) as {
    data?: { site?: { settings?: { locales?: LocaleNode[] } | null } };
  };

  const localeNodes = body.data?.site?.settings?.locales;

  if (!localeNodes?.length) {
    throw new Error('No locales returned from BigCommerce site settings');
  }

  return deriveLocaleRouting(localeNodes);
};

// Deliberately does not swallow fetch failures: degrading silently would let the alternate-locale
// suite pass by skipping.
const resolveLocaleRouting = async (): Promise<LocaleRouting> => {
  const resolved = await fetchLocaleRouting();

  if (!resolved.locales.includes(testEnv.TESTS_LOCALE)) {
    throw new Error(
      `TESTS_LOCALE "${testEnv.TESTS_LOCALE}" is not configured on this store. Available locales: ${resolved.locales.join(', ')}.`,
    );
  }

  return resolved;
};

let localeRouting: Promise<LocaleRouting> | undefined;

/**
 * The store's locale routing, fetched once per test process.
 *
 * @returns {Promise<LocaleRouting>} Locale codes, subfolder prefixes, and the locale served at "/".
 */
export const getTestLocaleRouting = () => {
  localeRouting ??= resolveLocaleRouting();

  return localeRouting;
};

/**
 * The URL subfolder the storefront serves `TESTS_LOCALE` under, e.g. `/de-de` — which is not
 * necessarily `/${locale}`, since merchants configure the subfolder independently of the code.
 *
 * Empty when the test locale is served unprefixed at "/".
 *
 * @returns {Promise<string>} The subfolder prefix, or an empty string.
 */
export const getTestLocalePrefix = async () =>
  getLocalePrefix(await getTestLocaleRouting(), testEnv.TESTS_LOCALE);

/**
 * Whether `TESTS_LOCALE` is reached via a subfolder rather than at the bare root.
 *
 * @returns {Promise<boolean>} True when the test locale has a URL prefix.
 */
export const isTestLocalePrefixed = async () => (await getTestLocalePrefix()) !== '';

/**
 * Prefixes a root-relative path with the test locale's subfolder.
 *
 * @param {string} path - A root-relative path, e.g. `/account/orders/`.
 * @returns {Promise<string>} The path prefixed with the test locale's subfolder.
 */
export const withTestLocalePrefix = async (path: string) => `${await getTestLocalePrefix()}${path}`;
