import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByLabel('Open search popup').click();
  await page.getByPlaceholder('Search...').click();
  await page.getByPlaceholder('Search...').fill('brewer');
  await page.getByPlaceholder('Search...').press('Enter');
  await page.getByRole('link', { name: '[Sample] Able Brewing System' }).isVisible();
  await page.getByRole('link', { name: '[Sample] Able Brewing System' }).click();

  await page.getByLabel('Open search popup').click();
  await page.getByPlaceholder('Search...').click();
  await page.getByPlaceholder('Search...').fill('canvas');
  await page.getByPlaceholder('Search...').press('Enter');
  await page.getByRole('link', { name: '[Sample] Canvas Laundry Cart' }).isVisible();
  await page.getByRole('link', { name: '[Sample] Canvas Laundry Cart' }).click();
});
