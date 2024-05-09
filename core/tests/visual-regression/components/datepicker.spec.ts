import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Date picker', async ({ page }) => {
  // Arrange
  await page.goto(routes.QUICK_ADD_77);

  // Act
  const datePicker = page.getByRole('dialog').getByPlaceholder('MM/DD/YYYY');

  await datePicker.waitFor();

  // Assert
  await expect(datePicker).toHaveScreenshot();
});
