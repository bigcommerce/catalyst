import { expect, Page, test } from '@playwright/test';

const testUserEmail: string = process.env.TEST_ACCOUNT_EMAIL || '';
const testUserPassword: string = process.env.TEST_ACCOUNT_PASSWORD || '';

async function loginWithUserAccount(page: Page, email: string, password: string) {
  await page.goto('/login/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL('/account/');
}

test.describe.configure({ mode: 'serial' });

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
}

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);

  await expect(page).toHaveURL('/account/');
  await expect(page.getByRole('link', { name: 'Addresses' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Account settings' })).toBeVisible();

  await page.getByRole('link', { name: 'Addresses' }).click();
  await expect(page).toHaveURL('/account/addresses/');
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();

  await page.getByRole('link', { name: 'Account settings' }).click();
  await expect(page).toHaveURL('/account/settings/');
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();

  await logout(page);
});

test('Account dropdown is visible in header', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);

  await page.goto('/');

  await page.getByRole('button', { name: 'Account' }).click();

  await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeInViewport();

  await page.getByRole('menuitem', { name: 'Log out' }).click();
});
