import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Counter default', async ({ page }) => {
  // Arrange
  await page.goto(routes.QUICK_ADD_77);

  // Act
  const spinButton = page.getByRole('spinbutton', { name: 'Number' });

  await spinButton.waitFor();

  // Assert
  await expect(spinButton).toHaveScreenshot();
});
