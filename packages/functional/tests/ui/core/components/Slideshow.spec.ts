import { test } from '@playwright/test';

test('Navigate through slideshow on homepage and verify slide content', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Next slide').isVisible();
  await page.getByLabel('Next slide').click();
  await page.getByRole('heading', { name: 'Great Deals' }).isVisible();

  await page.getByLabel('Pause slideshow').click();
  await page.getByLabel('Play slideshow').click();

  await page.getByLabel('Next slide').click();
  await page.getByRole('heading', { name: 'Low Prices' }).isVisible();

  await page.getByLabel('Previous slide').click();
  await page.getByRole('heading', { name: 'Great Deals' }).isVisible();
});
