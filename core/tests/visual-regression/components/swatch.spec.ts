import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Swatch basic', async ({ page }) => {
  // Arrange
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  // Act
  const swatch = page.getByRole('radiogroup', { name: 'Color' });

  await swatch.waitFor();

  await expect(swatch).toHaveScreenshot();
});
