import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Default radio group', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const radioGroup = page.getByRole('radiogroup', { name: 'Radio' });

  await radioGroup.waitFor();

  // Assert
  await expect(radioGroup).toHaveScreenshot();
});

test('Default radio group selected', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const radioGroup = page.getByRole('radiogroup', { name: 'Radio' });

  await radioGroup.waitFor();
  await page.getByLabel('1', { exact: true }).click();

  // Assert
  await expect(radioGroup).toHaveScreenshot();
});
