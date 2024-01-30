import { test } from '@playwright/test';

test('Navigate carousel items on homepage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Best Selling Products' }).scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: '[Sample] Tiered Wire Basket' }).isVisible();

  await page.getByRole('button', { name: 'Next products' }).click();
  await page.getByRole('link', { name: '[Sample] Fog Linen Chambray' }).isVisible();

  await page.getByRole('button', { name: 'Previous products' }).click();
  await page.getByRole('link', { name: '[Sample] Tiered Wire Basket' }).isVisible();

  await page.getByRole('button', { name: 'Previous products' }).click();
  await page.getByRole('link', { name: '[Sample] Fog Linen Chambray' }).isVisible();
});
