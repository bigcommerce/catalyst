import { getLocalePrefix, LocaleRouting } from '~/i18n/locale-routing';
import { expect, test } from '~/tests/fixtures';
import { getTestLocaleRouting } from '~/tests/lib/locale';

// The switcher uppercases codes (CSS in the trigger, `toLocaleUpperCase` in the items).
const localeName = (locale: string) => new RegExp(`^${locale}$`, 'i');

// The URL a locale is served at, root or subfolder.
const pathFor = (localeRouting: LocaleRouting, locale: string) => {
  const prefix = getLocalePrefix(localeRouting, locale);

  return prefix === '' ? '/' : `${prefix}/`;
};

// Shape-agnostic: works whether a locale sits at "/" (`as-needed`) or all are prefixed (`always`).
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

  // Locale pinned because `firstPath` may be "/", where detection would redirect away.
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

  // Chromium derives `Accept-Language` from the context locale, and that beats per-request headers.
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

    // The explicit choice must now beat Accept-Language on every later visit.
    await page.goto('/');
    await expect(page).toHaveURL(firstPath ?? '/');
  } finally {
    await context.close();
  }
});
