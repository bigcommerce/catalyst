import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { test } from '~/tests/fixtures';

const testUserEmail: string = process.env.TEST_ACCOUNT_EMAIL || '';
const testUserPassword: string = process.env.TEST_ACCOUNT_PASSWORD || '';
const streetAddress: string = faker.location.streetAddress();
const firstName: string = faker.person.firstName();
const lastName: string = faker.person.lastName();
const state: string = faker.location.state();
const city: string = faker.location.city();
const zipCode = '76286';

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

test('Add and remove new address', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);
  await page.goto('/account/addresses');

  await page.getByRole('link', { name: 'Add new address' }).click();
  await page.getByRole('heading', { name: 'New address' }).waitFor();
  await page.getByRole('textbox', { name: 'First Name Required' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last Name Required' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Address Line 1 Required' }).fill(streetAddress);

  await page.getByRole('textbox', { name: 'Suburb/City Required' }).fill(city);
  await page.getByRole('combobox', { name: 'State/Province Required' }).click();
  await page.getByLabel(state, { exact: true }).click();
  await page.getByRole('textbox', { name: 'Zip/Postcode Required' }).fill(zipCode);

  await page.getByRole('button', { name: 'Add new address' }).click();

  await expect(page.getByText('Address added to your account')).toBeVisible();
  await expect(page.getByText(streetAddress, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).nth(1).click();

  await page.getByRole('button', { name: 'Delete address' }).click();

  await expect(page.getByText('Address deleted from your account')).toBeVisible();

  await expect(page.getByText(streetAddress, { exact: true })).toBeVisible({
    visible: false,
  });

  await logout(page);
});
