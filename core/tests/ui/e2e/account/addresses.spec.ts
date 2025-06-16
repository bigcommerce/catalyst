import { faker } from '@faker-js/faker';

import { expect, Page, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

async function fillAddressForm(page: Page) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const companyName = faker.company.name();
  const phoneNumber = faker.phone.number();
  const addressLine1 = faker.location.streetAddress();
  const addressLine2 = faker.location.secondaryAddress();
  const city = faker.location.city();
  const state = faker.location.state();
  const zipCode = faker.location.zipCode('#####');
  const country = 'United States';

  // TODO: Add translations for address form field labels
  await page.getByLabel('First name').fill(firstName);
  await page.getByLabel('Last name').fill(lastName);
  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Phone number').fill(phoneNumber);
  await page.getByLabel('Address line 1').fill(addressLine1);
  await page.getByLabel('Address line 2').fill(addressLine2);
  await page.getByLabel('Suburb/city').fill(city);
  await page.getByLabel('State/province').fill(state);
  await page.getByLabel('Zip/postcode').fill(zipCode);
  await page.getByLabel('Country').click();
  await page.getByRole('option', { name: country }).first().click();
  await page.getByRole('radio', { name: 'Home' }).click();

  return {
    firstName,
    lastName,
    companyName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
  };
}

async function assertAddressSectionHasAddress(
  page: Page,
  address: Awaited<ReturnType<typeof fillAddressForm>>,
) {
  const t = await getTranslations('Account.Addresses');
  const addressesSection = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: t('title') }) });

  await expect(
    addressesSection.getByText(`${address.firstName} ${address.lastName}`, { exact: true }),
  ).toBeVisible();
  await expect(addressesSection.getByText(address.companyName, { exact: true })).toBeVisible();
  await expect(addressesSection.getByText(address.addressLine1, { exact: true })).toBeVisible();
  await expect(addressesSection.getByText(address.addressLine2, { exact: true })).toBeVisible();
  await expect(
    addressesSection.getByText(`${address.city}, ${address.state} ${address.zipCode}`, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(addressesSection.getByText('US', { exact: true })).toBeVisible();
  await expect(addressesSection.getByText(address.phoneNumber, { exact: true })).toBeVisible();
}

test(
  'Adding a new address works as expected',
  { tag: [TAGS.writesData] },
  async ({ page, customer }) => {
    const t = await getTranslations('Account.Addresses');
    const { id } = await customer.login();

    // Ensure addresses are in a reliable state before the test
    await customer.deleteAllAddresses(id);

    await page.goto('/account/addresses/');
    await page.getByRole('button', { name: t('cta') }).click();

    const address = await fillAddressForm(page);

    await page.getByRole('button', { name: t('create'), exact: true }).click();
    await page.waitForLoadState('networkidle');

    await assertAddressSectionHasAddress(page, address);
  },
);

test(
  'Editing an address works as expected',
  { tag: [TAGS.writesData] },
  async ({ page, customer }) => {
    const t = await getTranslations('Account.Addresses');
    const { id } = await customer.login();

    await customer.deleteAllAddresses(id);

    const address = await customer.createAddress(id);

    await page.goto('/account/addresses/');
    await page.getByRole('button', { name: t('edit') }).click();

    await expect(page.getByLabel('First name')).toHaveValue(address.firstName);
    await expect(page.getByLabel('Last name')).toHaveValue(address.lastName);
    await expect(page.getByLabel('Company name')).toHaveValue(address.company ?? '');
    await expect(page.getByLabel('Phone number')).toHaveValue(address.phone ?? '');
    await expect(page.getByLabel('Address line 1')).toHaveValue(address.address1);
    await expect(page.getByLabel('Address line 2')).toHaveValue(address.address2 ?? '');
    await expect(page.getByLabel('Suburb/city')).toHaveValue(address.city);
    await expect(page.getByLabel('State/province')).toHaveValue(address.stateOrProvince ?? '');
    await expect(page.getByLabel('Zip/postcode')).toHaveValue(address.postalCode);
    await expect(page.getByRole('combobox', { name: 'Country' })).toHaveText(address.country);
    await page.getByRole('radio', { name: 'Home' }).click();

    const newAddress = await fillAddressForm(page);

    await page.getByRole('button', { name: t('update'), exact: true }).click();
    await page.waitForLoadState('networkidle');

    await assertAddressSectionHasAddress(page, newAddress);
  },
);

test('Deleting an address works as expected', async ({ page, customer }) => {
  const t = await getTranslations('Account.Addresses');
  const { id } = await customer.login();

  await customer.deleteAllAddresses(id);

  const address = await customer.createAddress(id);

  await page.goto('/account/addresses/');
  await page.getByRole('button', { name: t('delete') }).click();
  await page.waitForLoadState('networkidle');

  const addressesSection = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: t('title') }) });

  await expect(
    addressesSection.getByText(`${address.firstName} ${address.lastName}`, { exact: true }),
  ).not.toBeVisible();
});
