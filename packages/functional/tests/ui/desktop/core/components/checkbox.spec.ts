import { expect, test } from '@playwright/test';

test('Filter products by selecting checkbox', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Shop All' })
    .click();

  await expect(page.getByText('13 items')).toBeVisible();
  await page.getByLabel('OFS5 products').click();
  await expect(page.getByText('5 items')).toBeVisible();

  await page.getByLabel('OFS5 products').click();
  await expect(page.getByText('13 items')).toBeVisible();

  await page.getByLabel('Common Good1 products').click();
  await expect(page.getByText('1 item')).toBeVisible();
  await expect(page.getByRole('link', { name: '[Sample] Laundry Detergent' })).toBeVisible();

  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByText('13 items')).toBeVisible();
});
