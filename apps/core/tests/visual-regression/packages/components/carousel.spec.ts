import { expect, test } from '@playwright/test';

test('Carousel', async ({ page }) => {
  await page.goto('/');

  const slides = page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('tablist', { name: 'Slides' });

  await slides.scrollIntoViewIfNeeded();

  await expect(slides).toHaveScreenshot();
});
