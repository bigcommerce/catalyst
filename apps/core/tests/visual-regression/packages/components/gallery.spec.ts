import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Gallery image', async ({ page }) => {
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await expect(page.getByRole('figure').locator('img')).toBeVisible();

  await expect(page.getByRole('figure').locator('img')).toHaveScreenshot();
});

test('Gallery thumbnail image', async ({ page }) => {
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await expect(page.getByLabel('Thumbnail navigation')).toBeVisible();

  await expect(page.getByLabel('Thumbnail navigation')).toHaveScreenshot();
});
