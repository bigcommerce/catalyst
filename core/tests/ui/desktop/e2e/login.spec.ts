import { expect } from '@playwright/test';

import { test } from '~/tests/fixtures';

const testAccountEmail = process.env.TEST_ACCOUNT_EMAIL || '';
const testAccountPassword = process.env.TEST_ACCOUNT_PASSWORD || '';

test.describe.configure({ mode: 'serial' });

test('Account login and logout', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Login').click();
  await expect(page.getByLabel('Email')).toBeVisible();

  await page.getByLabel('Email').fill(testAccountEmail);
  await page.getByLabel('Password').fill(testAccountPassword);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL('/account/');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

  await page.getByLabel('Account').click();

  await expect(page.getByRole('menu', { name: 'Account' })).toBeVisible();

  await page.getByRole('menuitem', { name: 'Log out' }).click();

  await page.waitForURL('/login/');

  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
