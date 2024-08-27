import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Date picker', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const datePicker = page.getByPlaceholder('MM/DD/YYYY');

  await datePicker.waitFor();

  // Assert
  await expect(datePicker).toHaveScreenshot();
});
