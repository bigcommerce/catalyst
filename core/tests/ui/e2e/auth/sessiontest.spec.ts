import { expect, test } from '~/tests/fixtures';

import { getTranslations } from '../../../lib/i18n';

test.describe('Session tests', () => {
  test('Login test', async ({ page, customer }) => {
    await customer.login();

    await page.waitForURL('/account/wishlists/');
  });

  // TODO: Figure out how to disable cache when session is reused
  test('Login test 2', async ({ page, customer }) => {
    const t = await getTranslations('Wishlist');
    const { id } = await customer.login();

    await customer.createWishlist({ customerId: id });

    await page.goto('/account/wishlists/');
    await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();
  });
});
