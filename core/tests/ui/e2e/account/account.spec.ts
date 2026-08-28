import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { isTestLocalePrefixed, withTestLocalePrefix } from '~/tests/lib/locale';
import { TAGS } from '~/tests/tags';

const accountUrls = [
  '/account/orders',
  '/account/settings',
  '/account/addresses',
  '/account/wishlists',
];

accountUrls.forEach((url) => {
  test(`${url} page is restricted for guest users`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveURL('/login/');
  });
});

accountUrls.forEach((url) => {
  test(
    `${url} is restricted for guest users when explicitly browsing to the locale URL`,
    { tag: TAGS.alternateLocale },
    async ({ page }) => {
      test.skip(!(await isTestLocalePrefixed()));

      // The locale's configured subfolder, which is not necessarily `/${TESTS_LOCALE}` — next-intl
      // treats a custom subfolder as a replacement for the bare locale code, not an alias, so
      // hitting `/de/...` on a store configured as `/de-de` is a 404.
      await page.goto(await withTestLocalePrefix(url));
      await expect(page).toHaveURL('/login/', { timeout: 1000 });
    },
  );
});

test('Account page displays the menu items for each section', async ({ page, customer }) => {
  const t = await getTranslations('Account.Layout');

  await customer.login();

  await expect(page.getByRole('link', { name: t('orders') })).toBeVisible();
  await expect(page.getByRole('link', { name: t('addresses') })).toBeVisible();
  await expect(page.getByRole('link', { name: t('settings') })).toBeVisible();
  await expect(page.getByRole('link', { name: t('wishlists') })).toBeVisible();
  await expect(page.getByRole('link', { name: t('logout') })).toBeVisible();
});

test('Account icon is visible in the header menu and navigates to the login page for guest users', async ({
  page,
}) => {
  const t = await getTranslations('Components.Header.Icons');

  await page.goto('/');
  await page.getByLabel(t('account')).click();
  await expect(page).toHaveURL('/login/');
});

test('Account icon is visible in the header menu and navigates to the account page for logged in users', async ({
  page,
  customer,
}) => {
  const t = await getTranslations('Components.Header.Icons');

  await customer.login('/');

  await page.getByLabel(t('account')).click();
  await expect(page).toHaveURL('/account/orders/');
});
