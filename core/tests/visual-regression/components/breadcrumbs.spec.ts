import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('breadcrumbs', async ({ page }) => {
  // Arrange
  await page.goto(routes.BATH_LUXURY);

  // Act
  const breadcrumb = page.getByLabel('Breadcrumb');

  await breadcrumb.waitFor();

  // Assert
  await expect(breadcrumb).toHaveScreenshot();
});
