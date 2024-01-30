import { expect, test } from '@playwright/test';

let currentURL = '';

test('Select various radio buttons and verify changes', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();
  await page.getByRole('button', { name: 'Quick add' }).first().click();
  await page.getByLabel('Radio').getByText('1').click();

  await expect(page).toHaveURL('shop-all?134=139');
  currentURL = page.url();

  await page.getByLabel('Radio').getByText('2').click();

  await expect(page).toHaveURL('shop-all?134=140');
  expect(page.url()).not.toEqual(currentURL);
  currentURL = page.url();

  await page.getByLabel('Radio').getByText('3').click();
  await expect(page).toHaveURL('shop-all?134=141');
  expect(page.url()).not.toEqual(currentURL);
});
