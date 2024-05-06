import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Gallery image', async ({ page }) => {
  // Arrange
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);

  // Act
  const gallery = page.getByRole('figure').locator('img');

  await gallery.waitFor();

  // Assert
  await expect(gallery).toHaveScreenshot();
});

test('Gallery thumbnail image', async ({ page }) => {
  // Arrange
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);

  // Act
  const thumbnail = page.getByLabel('Thumbnail navigation');

  await thumbnail.waitFor();

  // Assert
  await expect(page.getByLabel('Thumbnail navigation')).toHaveScreenshot();
});
