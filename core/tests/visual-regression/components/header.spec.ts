import { expect, test } from '~/tests/fixtures';

test('Header', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const navigation = page.getByRole('navigation', { name: 'Main' });

  await page.waitForLoadState('networkidle');

  // Assert
  await expect(navigation).toBeInViewport();
  await expect(navigation).toHaveScreenshot();
});
