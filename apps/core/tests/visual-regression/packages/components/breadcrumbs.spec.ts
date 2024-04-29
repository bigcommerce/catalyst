import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('breadcrumbs', async ({ page }) => {
  await page.goto(routes.BATH_LUXURY);
  await expect(page.getByLabel('Breadcrumb')).toBeVisible();

  await expect(page.getByLabel('Breadcrumb')).toHaveScreenshot();
});
