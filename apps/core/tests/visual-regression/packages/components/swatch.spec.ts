import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Swatch basic', async ({ page }) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);
  await expect(page.getByRole('radiogroup', { name: 'Color' })).toBeVisible();

  await expect(page.getByRole('radiogroup', { name: 'Color' })).toHaveScreenshot();
});
