import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('accordion expanded', async ({ page }) => {
  await page.goto(routes.SHOP_ALL);

  const accordion = page
    .locator('div[data-state="open"]')
    .filter({ has: page.getByRole('button', { name: 'Brand', expanded: true }) });

  await expect(accordion).toHaveScreenshot();
});

test('accordion closed', async ({ page }) => {
  await page.goto(routes.SHOP_ALL);

  await page.getByRole('button', { name: 'Brand', expanded: true }).click();

  const accordion = page
    .locator('div[data-state="closed"]')
    .filter({ has: page.getByRole('button', { name: 'Brand', expanded: false }) });

  await expect(accordion).toHaveScreenshot();
});
