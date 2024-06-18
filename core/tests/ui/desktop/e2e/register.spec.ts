import { expect, test } from '@playwright/test';

import { testUser } from '~/tests/test-data';

test('Account register', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Create Account').click();
  await page.getByRole('heading', { name: 'New account' }).waitFor();

  await page.getByLabel('Email Address').fill(testUser.emailAddress);
  await page.getByLabel('Password').fill(testUser.password);
  await page.getByLabel('Confirm Password').fill(testUser.password);
  await page.getByLabel('First Name').fill(testUser.firstName);
  await page.getByLabel('Phone Number').fill(testUser.phoneNumber);
  await page.getByLabel('Address Line 1').fill(testUser.streetAddress);
  await page.getByLabel('Suburb/City').fill(testUser.city);
  await page.getByLabel('Zip/Postcode').fill(testUser.zipCode);

  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

  await page.getByLabel('Account').click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
