import { getLocalePrefix, LocaleRouting } from '~/i18n/locale-routing';
import { expect, test } from '~/tests/fixtures';
import { getTestLocaleRouting } from '~/tests/lib/locale';

// The switcher renders locale codes, uppercased via CSS in the trigger and via `toLocaleUpperCase`
// in the menu items, so match the code case-insensitively but anchored.
const localeName = (locale: string) => new RegExp(`^${locale}$`, 'i');

// The URL a locale is served at, whether it sits at the bare root or under a subfolder.
const pathFor = (localeRouting: LocaleRouting, locale: string) => {
  const prefix = getLocalePrefix(localeRouting, locale);

  return prefix === '' ? '/' : `${prefix}/`;
};

// Deliberately shape-agnostic: works whether one locale sits at "/" (`as-needed`) or every locale
// carries a prefix (`always`), since that depends on merchant configuration.
const resolveLocalePair = async () => {
  const localeRouting = await getTestLocaleRouting();
  const [first, second] = localeRouting.locales;

  return {
    first,
    second,
    firstPath: first ? pathFor(localeRouting, first) : undefined,
    secondPath: second ? pathFor(localeRouting, second) : undefined,
  };
};

const SKIP_REASON = 'Store needs at least two configured locales.';

test('switching locale navigates to that locale and records the choice', async ({ browser }) => {
  const { first, second, firstPath, secondPath } = await resolveLocalePair();

  test.skip(!first || !second, SKIP_REASON);

  // The context locale is pinned because `firstPath` may be "/", where Accept-Language detection
  // would otherwise redirect away from the locale under test.
  const context = await browser.newContext({ locale: first });
  const page = await context.newPage();

  try {
    await page.goto(firstPath ?? '/');

    await page
      .getByRole('button', { name: localeName(first ?? '') })
      .first()
      .click();
    await page.getByRole('menuitem', { name: localeName(second ?? '') }).click();

    await expect(page).toHaveURL(secondPath ?? '/');

    const cookies = await context.cookies();

    expect(cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value).toBe(second);
  } finally {
    await context.close();
  }
});

test('an explicit locale choice survives Accept-Language detection', async ({ browser }) => {
  const { first, second, firstPath, secondPath } = await resolveLocalePair();

  test.skip(!first || !second, SKIP_REASON);

  // Chromium derives `Accept-Language` from the context locale, and that wins over per-request
  // headers, so locale detection has to be exercised by setting the browser locale itself.
  const context = await browser.newContext({ locale: second });
  const page = await context.newPage();

  try {
    // Detection sends this shopper to their browser's language.
    await page.goto('/');
    await expect(page).toHaveURL(secondPath ?? '/');

    // Explicitly choose the other locale.
    await page
      .getByRole('button', { name: localeName(second ?? '') })
      .first()
      .click();
    await page.getByRole('menuitem', { name: localeName(first ?? '') }).click();

    await expect(page).toHaveURL(firstPath ?? '/');

    const cookies = await context.cookies();

    expect(cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value).toBe(first);

    // The explicit choice must now win over Accept-Language, rather than bouncing the shopper back
    // to their browser language on every visit.
    await page.goto('/');
    await expect(page).toHaveURL(firstPath ?? '/');
  } finally {
    await context.close();
  }
});
