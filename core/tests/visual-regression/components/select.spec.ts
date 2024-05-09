import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Select default', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const select = page.getByRole('combobox');

  await select.waitFor();

  // Assert
  await expect(select).toHaveScreenshot();
});
