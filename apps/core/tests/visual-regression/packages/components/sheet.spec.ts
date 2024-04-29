import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Sheet basic', async ({ page }) => {
  await page.goto(routes.QUICK_ADD_93);
  await expect(page.getByLabel('Choose options')).toBeVisible();

  await expect(page.getByLabel('Choose options')).toHaveScreenshot();
});
