import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Zero star rating', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const rating = page.getByRole('paragraph').getByRole('img').first();

  await rating.waitFor();

  // Assert
  await expect(page.getByRole('paragraph').getByRole('img').first()).toHaveScreenshot();
});

test('Five start rating', async ({ page }) => {
  // Arrange
  await page.goto(routes.PARFAIT_JAR);

  // Act
  const rating = page.getByRole('paragraph').getByRole('img').first();

  await rating.waitFor();

  // Assert
  await expect(rating).toHaveScreenshot();
});

test('Floating rating', async ({ page }) => {
  // Arrange
  await page.goto(routes.ORBIT_TERRARIUM_LARGE);

  // Act
  const rating = page.getByRole('paragraph').getByRole('img').first();

  await rating.waitFor();

  // Assert
  await expect(rating).toHaveScreenshot();
});
