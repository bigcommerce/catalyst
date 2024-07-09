import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const password = faker.internet.password();
const firstName = faker.person.firstName();
const lastName = faker.person.lastName();

test('Account register', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('link', { name: 'Create Account' }).click();
  await page.getByRole('heading', { name: 'New account' }).waitFor();

  await page
    .getByLabel('Email Address')
    .fill(faker.internet.email({ provider: 'mybigcommerce.com' }));
  await page.getByLabel('PasswordRequired', { exact: true }).fill(password);
  await page.getByLabel('Confirm PasswordRequired').fill(password);
  await page.getByLabel('First NameRequired').fill(firstName);
  await page.getByLabel('Last NameRequired').fill(lastName);
  await page.getByLabel('Phone Number').fill(faker.phone.number());
  await page.getByLabel('Address Line 1Required').fill(faker.location.streetAddress());
  await page.getByLabel('Suburb/CityRequired').fill(faker.location.city());
  await page.getByLabel('Zip/PostcodeRequired').fill(faker.location.zipCode());

  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByLabel(
      `Dear ${firstName} ${lastName}, your account was successfully created. Redirecting to account...`,
    ),
  ).toBeVisible();
  await page.getByRole('heading', { name: 'My Account' }).waitFor();
  await expect(page).toHaveURL('account/');
});
