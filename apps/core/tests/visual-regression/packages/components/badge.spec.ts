import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('badge with icon', async ({ page }) => {
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();

  await expect(page.getByRole('link', { name: 'Cart Items 1' })).toHaveScreenshot();

  await page.getByRole('button', { name: 'Remove item from cart' }).first().click();
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
});
