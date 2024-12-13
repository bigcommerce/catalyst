import { faker } from '@faker-js/faker';

import { expect, type Page, test } from '~/tests/fixtures';

const streetAddress: string = faker.location.streetAddress();
const state: string = faker.location.state();
const city: string = faker.location.city();
const zipCode = faker.location.zipCode('#####');

async function fillAddressForm(page: Page) {
  await page.getByRole('textbox', { name: 'First Name Required' }).fill(faker.person.firstName());
  await page.getByRole('textbox', { name: 'Last Name Required' }).fill(faker.person.lastName());
  await page.getByRole('textbox', { name: 'Address Line 1 Required' }).fill(streetAddress);
  await page.getByRole('textbox', { name: 'Suburb/City Required' }).fill(city);
  await page.getByRole('combobox', { name: 'State/Province Required' }).click();
  await page.getByLabel(state, { exact: true }).scrollIntoViewIfNeeded();
  await page.getByLabel(state, { exact: true }).click();
  await page.getByRole('textbox', { name: 'Zip/Postcode Required' }).fill(zipCode);
}

test('Add new address', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/addresses');
  await page.getByRole('link', { name: 'Add new address' }).click();
  await page.waitForURL('/account/addresses/add/');
  await page.getByRole('heading', { name: 'New address' }).waitFor();
  await fillAddressForm(page);
  await page.getByRole('button', { name: 'Add new address' }).click();
  await page.waitForURL('/account/addresses/');

  await expect(page.getByText('Address added to your account.')).toBeVisible();

  await customer.logout();
});

test('Edit address', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/addresses');
  await page.getByRole('link', { name: 'Edit' }).nth(0).click();
  await page.getByRole('heading', { name: 'Edit address' }).waitFor();
  await page.getByRole('button', { name: 'Edit address' }).click();
  await page.waitForURL('/account/addresses/');

  await expect(page.getByText('The address has been successfully updated.')).toBeVisible();

  await customer.logout();
});

test('Remove address', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/addresses');
  await page.getByRole('link', { name: 'Add new address' }).click();
  await page.waitForURL('/account/addresses/add/');
  await page.getByRole('heading', { name: 'New address' }).waitFor();
  await fillAddressForm(page);
  await page.getByRole('button', { name: 'Add new address' }).click();
  await page.waitForURL('/account/addresses/');
  await page.getByRole('button', { name: 'Delete' }).nth(0).click();
  await page.getByRole('button', { name: 'Delete address' }).click();

  await expect(page.getByText('Address deleted from your account.')).toBeVisible();

  await customer.logout();
});
