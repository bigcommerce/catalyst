import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Select default', async ({ page }) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);
  await expect(page.getByRole('combobox')).toBeVisible();

  await expect(page.getByRole('combobox')).toHaveScreenshot();
});
