import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Label with input', async ({ page }) => {
  // Arrange
  await page.goto(routes.LOGIN);

  // Act
  const label = page.getByText('Password', { exact: true });

  await label.waitFor();

  // Assert
  await expect(label.locator('..')).toHaveScreenshot();
});
