import { expect, test } from '@playwright/test';

test('Carousel', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('tablist', { name: 'Slides' })
    .scrollIntoViewIfNeeded();

  await expect(
    page
      .getByRole('region')
      .filter({ has: page.getByRole('heading', { name: 'Featured products' }) }),
  ).toHaveScreenshot();
});
