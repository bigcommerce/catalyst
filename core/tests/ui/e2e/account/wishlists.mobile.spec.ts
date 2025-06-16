import { devices } from '@playwright/test';

import { testEnv } from '~/tests/environment';
import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test.use({ ...devices['iPhone 11'], permissions: ['clipboard-read'] });

test('Share button calls navigator.share with the correct URL', async ({ page, customer }) => {
  const navigatorShareData: { hasBeenCalled: boolean; shareUrl?: string } = {
    hasBeenCalled: false,
    shareUrl: undefined,
  };

  const setNavigatorShareCalled = (data?: ShareData) => {
    navigatorShareData.hasBeenCalled = true;
    navigatorShareData.shareUrl = data?.url;
  };

  await page.exposeFunction('setNavigatorShareCalled', setNavigatorShareCalled);
  await page.addInitScript(() => {
    const originalNavigatorShare = window.navigator.share.bind(window.navigator);

    window.navigator.share = async (data) => {
      setNavigatorShareCalled(data);

      return originalNavigatorShare(data);
    };
  });

  const t = await getTranslations('Wishlist');
  const { id: customerId } = await customer.login();
  const { name, token } = await customer.createWishlist({
    customerId,
    isPublic: true,
  });

  await page.goto('/account/wishlists/');
  await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

  const locator = page.getByRole('region', { name });

  await locator.getByRole('button', { name: t('actionsTitle') }).click();
  await page.getByRole('menuitem', { name: t('share') }).click();

  await expect(page.getByText(t('shareSuccess'))).toBeVisible();

  const expectedUrl = `${testEnv.PLAYWRIGHT_TEST_BASE_URL}/wishlist/${token}`;

  expect(navigatorShareData.hasBeenCalled).toBe(true);
  expect(navigatorShareData.shareUrl).toBe(expectedUrl);
});
