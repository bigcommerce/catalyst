import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Next slide')).toBeVisible();
});

test('Navigate to next slide', async ({ page }) => {
  await page.getByLabel('Next slide').click();

  await expect(page.getByRole('heading', { name: 'Great Deals' })).toBeVisible();
});

test('Navigate to previous slide', async ({ page }) => {
  await page.getByLabel('Previous slide').click();

  await expect(page.getByRole('heading', { name: 'Low Prices' })).toBeVisible();
});

test.skip('Pause slideshow', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '25% Off Sale' })).toBeVisible();

  await page.waitForTimeout(12);

  await expect(page.getByRole('heading', { name: 'Great Deals' })).toBeVisible();

  await page.getByLabel('Pause slideshow').click();

  await page.waitForTimeout(12);

  await expect(page.getByRole('heading', { name: 'Great Deals' })).toBeVisible();
});

