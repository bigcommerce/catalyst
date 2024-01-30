import { expect, test } from '@playwright/test';

let currentURL = '';

test('Select options on color panel and verify changes are reflected', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();
  await page.getByRole('button', { name: 'Quick add' }).first().click();
  await page.getByRole('radio', { name: 'Color Silver' }).click();

  await expect(page).toHaveURL('shop-all?109=103');
  currentURL = page.url();

  await page.getByRole('radio', { name: 'Color Purple' }).click();

  await expect(page).toHaveURL('shop-all?109=105');
  expect(page.url()).not.toEqual(currentURL);
  currentURL = page.url();

  await page.getByRole('radio', { name: 'Color Orange' }).click();

  await expect(page).toHaveURL('shop-all?109=109');
  expect(page.url()).not.toEqual(currentURL);
});
