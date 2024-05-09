import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Pick list', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const pickList = page.getByLabel('Pick List');

  await pickList.waitFor();

  // Assert
  await expect(pickList.locator('..')).toHaveScreenshot();
});
