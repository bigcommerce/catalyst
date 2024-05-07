import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Sheet basic', async ({ page }) => {
  // Arrange
  await page.goto(routes.QUICK_ADD_93);

  // Act
  const sheet = page.getByLabel('Choose options');

  await sheet.waitFor();
  await page.waitForLoadState('networkidle');
  await sheet.waitFor();

  // Assert
  await expect(sheet).toHaveScreenshot();
});
