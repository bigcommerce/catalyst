import { expect, test } from '@playwright/test';

test('Verify breadcrumbs on product selection', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).hover();

  await expect(page.getByRole('link', { name: 'Knives' })).toBeVisible();

  await page.getByRole('link', { name: 'Most popular' }).click();

  await expect(page.getByLabel('Breadcrumb').getByRole('list')).toContainText('Kitchen');
  await expect(page.getByLabel('Breadcrumb').getByRole('list')).toContainText('Knives');
  await expect(page.getByLabel('Breadcrumb').getByRole('list')).toContainText('Most popular');
});
