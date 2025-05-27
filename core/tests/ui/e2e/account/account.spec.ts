import { defaultLocale } from '~/i18n/locales';
import { testEnv } from '~/tests/environment';
import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

const accountUrls = [
  '/account/orders',
  '/account/settings',
  '/account/addresses',
  '/account/wishlists',
];

test.describe('Account page', () => {
  accountUrls.forEach((url) => {
    test(`${url} page is restricted for guest users`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveURL('/login/');
    });
  });

  accountUrls.forEach((url) => {
    test(`${url} is restricted for guest users when explicitly browsing to the locale URL`, async ({
      page,
    }) => {
      test.skip(testEnv.TESTS_LOCALE === 'en' && testEnv.TESTS_LOCALE !== defaultLocale);

      await page.goto(`/${testEnv.TESTS_LOCALE}/${url}`);
      await expect(page).toHaveURL('/login/', { timeout: 1000 });
    });
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
});
