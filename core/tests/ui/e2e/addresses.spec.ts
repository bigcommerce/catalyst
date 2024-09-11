import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';

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

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
}

test.describe.configure({ mode: 'serial' });

test('Add new address', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);
  await page.goto('/account/addresses');

  await page.getByRole('link', { name: 'Add new address' }).click();

  await page.waitForURL('/account/addresses/add/');

  await page.getByRole('heading', { name: 'New address' }).waitFor();
  await page.getByRole('textbox', { name: 'First Name Required' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last Name Required' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Address Line 1 Required' }).fill(streetAddress);

  await page.getByRole('textbox', { name: 'Suburb/City Required' }).fill(city);
  await page.getByRole('combobox', { name: 'State/Province Required' }).click();
  await page.getByLabel(state, { exact: true }).click();
  await page.getByRole('textbox', { name: 'Zip/Postcode Required' }).fill(zipCode);

  await page.getByRole('button', { name: 'Add new address' }).click();

  await page.waitForURL('/account/addresses/');

  await expect(page.getByText('Address added to your account.')).toBeVisible();
  await logout(page);
});

test('Edit address', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);
  await page.goto('/account/addresses');

  await page.getByRole('link', { name: 'Edit' }).nth(1).click();

  await page.getByRole('heading', { name: 'Edit address' }).waitFor();
  await page.getByRole('button', { name: 'Edit address' }).click();

  await page.waitForURL('/account/addresses/');

  await expect(page.getByText('The address has been succesfully updated.')).toBeVisible();

  await logout(page);
});

test('Remove address', async ({ page }) => {
  await loginWithUserAccount(page, testUserEmail, testUserPassword);
  await page.goto('/account/addresses');

  await page.getByRole('button', { name: 'Delete' }).nth(1).click();

  await page.getByRole('button', { name: 'Delete address' }).click();

  await expect(page.getByText('Address deleted from your account.')).toBeVisible();

  await logout(page);
});
