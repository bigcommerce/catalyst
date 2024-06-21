import { expect, test } from '@playwright/test';

import { testUser } from '~/tests/test-data';

test('Account login and logout', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Login').click();
  await expect(page.getByLabel('Email')).toBeVisible();

  await page.getByLabel('Email').fill(testUser.emailAddress);
  await page.getByLabel('Password').fill(testUser.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

  await page.getByLabel('Account').click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
