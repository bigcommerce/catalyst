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
  await page.getByLabel('Login').click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL('/account/');
}

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);

  await expect(page).toHaveURL('/account/');
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Messages' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Addresses' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wish lists' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Recently viewed' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Account settings' })).toBeVisible();

  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page).toHaveURL('/account/orders/');
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

  await page.getByRole('link', { name: 'Messages' }).click();
  await expect(page).toHaveURL('/account/messages/');
  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();

  await page.getByRole('link', { name: 'Addresses' }).click();
  await expect(page).toHaveURL('/account/addresses/');
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();

  await page.getByRole('link', { name: 'Wish lists' }).click();
  await expect(page).toHaveURL('/account/wishlists/');
  await expect(page.getByRole('heading', { name: 'Wish lists' })).toBeVisible();

  await page.getByRole('link', { name: 'Recently viewed' }).click();
  await expect(page).toHaveURL('/account/recently-viewed/');
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible();

  await page.getByRole('link', { name: 'Account settings' }).click();
  await expect(page).toHaveURL('/account/settings/');
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();
});

test('Account dropdown is visible in header', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);

  await page.goto('/');

  await page.getByRole('button', { name: 'Account' }).click();

  await expect(page.getByText('Log out')).toBeInViewport();
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
  await page.getByRole('combobox', { name: 'Choose state or province' }).click();
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
});
