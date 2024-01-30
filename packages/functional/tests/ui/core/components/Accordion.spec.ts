import { test } from '@playwright/test';

test('Verify accordion behavior on header', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).isVisible();

  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).hover();
  await page.getByRole('link', { name: 'Knives' }).isVisible();
  await page.getByRole('link', { name: 'Plates' }).isVisible();

  await page.getByLabel('Main').getByRole('link', { name: 'Garden' }).isVisible();
  await page.getByLabel('Main').getByRole('link', { name: 'Garden' }).hover();
  await page.getByRole('link', { name: 'Knives' }).isHidden();
  await page.getByRole('link', { name: 'Plates' }).isHidden();
});

test('Verify accordion behavior on desktop filter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).click();
  await page.getByRole('button', { name: 'Color' }).isVisible();
  await page.getByText('Black1 products').isVisible();
  await page.getByText('Blue1 products').isVisible();

  await page.getByRole('button', { name: 'Color' }).click();
  await page.getByText('Black1 products').isHidden();
  await page.getByText('Blue1 products').isHidden();
});
