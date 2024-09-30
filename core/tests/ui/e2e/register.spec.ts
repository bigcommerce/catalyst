import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';

// Prefix is added to ensure that the password requirements are met
const password = faker.internet.password({ pattern: /[a-zA-Z0-9]/, prefix: '1At', length: 10 });

test('Account register', async ({ page }) => {
  await page.goto('/register');

  await page.getByRole('heading', { name: 'New account' }).waitFor();

  await page.getByLabel('Email Address').fill(faker.internet.email({ provider: 'example.com' }));
  await page.getByLabel('PasswordRequired', { exact: true }).fill(password);
  await page.getByLabel('Confirm PasswordRequired').fill(password);
  await page.getByLabel('First NameRequired').fill(faker.person.firstName());
  await page.getByLabel('Last NameRequired').fill(faker.person.lastName());
  await page.getByLabel('Phone Number').fill(faker.phone.number());
  await page.getByLabel('Address Line 1Required').fill(faker.location.streetAddress());
  await page.getByLabel('Suburb/CityRequired').fill(faker.location.city());
  await page.getByLabel('Zip/PostcodeRequired').fill(faker.location.zipCode());

  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/en/account/');
  await expect(page.getByText('Your account has been successfully created')).toBeVisible();
});

test('Account is not created if email is already in use', async ({ page, account }) => {
  const customer = await account.create();

  await page.goto('/register');

  await page.getByLabel('Email Address').fill(customer.email);
  await page.getByLabel('PasswordRequired', { exact: true }).fill(password);
  await page.getByLabel('Confirm PasswordRequired').fill(password);
  await page.getByLabel('First NameRequired').fill(faker.person.firstName());
  await page.getByLabel('Last NameRequired').fill(faker.person.lastName());
  await page.getByLabel('Address Line 1Required').fill(faker.location.streetAddress());
  await page.getByLabel('Suburb/CityRequired').fill(faker.location.city());
  await page.getByLabel('Zip/PostcodeRequired').fill(faker.location.zipCode());

  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('The email address is already in use.')).toBeVisible();
});
