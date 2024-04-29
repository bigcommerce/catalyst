import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('breadcrumbs', async ({ page }) => {
  await page.goto(routes.BATH_LUXURY);

  const breadcrumb = page.getByLabel('Breadcrumb');

  await expect(breadcrumb).toBeVisible();

  await expect(breadcrumb).toHaveScreenshot();
});
