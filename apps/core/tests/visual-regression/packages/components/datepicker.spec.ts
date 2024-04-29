import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Date picker', async ({ page }) => {
  await page.goto(routes.QUICK_ADD_77);
  await expect(page.getByRole('dialog').getByPlaceholder('MM/DD/YYYY')).toBeVisible();

  await expect(page.getByRole('dialog').getByPlaceholder('MM/DD/YYYY')).toHaveScreenshot();
});
