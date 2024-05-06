import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Rectangle list', async ({ page }) => {
  // Arrange
  await page.goto(routes.PARFAIT_JAR);

  // Act
  const rectangleList = page.getByRole('radiogroup', { name: 'Size' });

  await rectangleList.waitFor();

  // Assert
  await expect(rectangleList).toHaveScreenshot();
});
