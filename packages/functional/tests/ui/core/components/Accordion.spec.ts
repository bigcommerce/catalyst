import { expect, test } from '@playwright/test';

test('Verify accordion behavior on header', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Kitchen' }),
  ).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Kitchen' })
    .hover();
  await expect(page.getByRole('link', { name: 'Knives' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Plates' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Garden' }),
  ).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Garden' })
    .hover();
  await expect(page.getByRole('link', { name: 'Knives' })).toBeHidden();
  await expect(page.getByRole('link', { name: 'Plates' })).toBeHidden();
});

test('Verify accordion behavior on desktop filter', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Kitchen' }),
  ).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Kitchen' })
    .click();

  await expect(page.getByRole('button', { name: 'Color' })).toBeVisible();
  await expect(page.getByText('Black1 products')).toBeVisible();
  await expect(page.getByText('Blue1 products')).toBeVisible();

  await page.getByRole('button', { name: 'Color' }).click();
  await expect(page.getByText('Black1 products')).toBeHidden();
  await expect(page.getByText('Blue1 products')).toBeHidden();
});
