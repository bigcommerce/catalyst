import { expect, test } from '@playwright/test';

test('Increase count and verify the results', async ({ page }) => {
  await page.goto('/orbit-terrarium-large/');

  await expect(page.getByRole('spinbutton')).toHaveValue('1');

  await page.getByLabel('Increase count').click();
  await page.getByLabel('Increase count').click();

  await expect(page.getByRole('spinbutton')).toHaveValue('3');
});

test('Decrease count and verify the results', async ({ page }) => {
  await page.goto('/orbit-terrarium-large/');

  await expect(page.getByRole('spinbutton')).toHaveValue('1');

  await page.getByLabel('Increase count').click();
  await expect(page.getByRole('spinbutton')).toHaveValue('2');

  await page.getByLabel('Decrease count').click();

  await expect(page.getByRole('spinbutton')).toHaveValue('1');
});
