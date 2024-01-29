import { test } from '@playwright/test';

test('Filter products by selecting checkbox', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();

  await page.getByText('13 items').isVisible();
  await page.getByLabel('OFS5 products').click();
  await page.getByText('5 items').isVisible();

  await page.getByLabel('OFS5 products').click();
  await page.getByText('13 items').isVisible();

  await page.getByLabel('Common Good1 products').click();
  await page.getByText('1 items').isVisible();
  await page.getByRole('link', { name: '[Sample] Laundry Detergent' }).isVisible();

  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByText('13 items').isVisible();
});
