import { expect, test } from '@playwright/test';

const testAccountEmail = process.env.TEST_ACCOUNT_EMAIL || '';
const testAccountPassword = process.env.TEST_ACCOUNT_PASSWORD || '';

test('Tabs', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Login').click();
  await expect(page.getByLabel('Email')).toBeVisible();

  await page.getByLabel('Email').fill(testAccountEmail);
  await page.getByLabel('Password').fill(testAccountPassword);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

  await page.getByRole('link', { name: 'Account settings' }).click();
  await expect(page.getByLabel('Account Tabs')).toBeVisible();

  await expect(page.getByLabel('Account Tabs')).toHaveScreenshot();
});
