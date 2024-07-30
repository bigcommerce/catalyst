import { expect, test } from '@playwright/test';

test('Header', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const navigation = page.getByRole('navigation', { name: 'Main' });

  await navigation.waitFor();

  // Assert
  await expect(navigation).toHaveScreenshot();
});
