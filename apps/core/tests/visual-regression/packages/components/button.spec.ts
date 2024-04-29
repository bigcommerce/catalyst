import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Primary button', async ({ page }) => {
  await page.goto(routes.ORBIT_TERRARIUM_LARGE);
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveScreenshot();
});

test('Secondary button', async ({ page }) => {
  await page.goto(routes.SHOP_ALL);
  await expect(page.getByRole('button', { name: 'Update price' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Update price' })).toHaveScreenshot();
});

test('As a child', async ({ page }) => {
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await expect(page.getByText('Shipping cost')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Add' }).first()).toHaveScreenshot();
});
