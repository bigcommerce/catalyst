import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Pick list', async ({ page }) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);
  await expect(page.getByLabel('Pick List')).toBeVisible();

  await expect(page.getByLabel('Pick List').locator('..')).toHaveScreenshot();
});
