import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test.describe('Account registration', () => {
  test('Registration works as expected', { tag: [TAGS.writesData] }, async ({ page, customer }) => {
    const t = await getTranslations('Auth.Register');

    const email = faker.internet.email({ provider: 'example.com' });
    // Prefix is added to ensure that the password requirements are met
    const password = faker.internet.password({
      pattern: /[a-zA-Z0-9]/,
      prefix: '1At!',
      length: 10,
    });

    await page.goto('/register');
    await page.getByRole('heading', { name: t('heading') }).waitFor();

    // TODO: Form fields when creating a new account need to be translated
    await page.getByLabel('First Name').fill(faker.person.firstName());
    await page.getByLabel('Last Name').fill(faker.person.lastName());
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: t('cta') }).click();

    await expect(page).toHaveURL('/account/orders/');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

    const { id } = await customer.getByEmail(email);

    // Ensure registered customer is cleaned up after the test
    await customer.delete(id);
  });

  test('Registration fails if email is already in use', async ({ page, customer }) => {
    const { email } = await customer.createNewCustomer();
    const t = await getTranslations('Auth.Register');

    // Prefix is added to ensure that the password requirements are met
    const password = faker.internet.password({
      pattern: /[a-zA-Z0-9]/,
      prefix: '1At!',
      length: 10,
    });

    await page.goto('/register');
    await page.getByRole('heading', { name: t('heading') }).waitFor();

    // TODO: Form fields when creating a new account need to be translated
    await page.getByLabel('First Name').fill(faker.person.firstName());
    await page.getByLabel('Last Name').fill(faker.person.lastName());
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: t('cta') }).click();

    await expect(page).not.toHaveURL('/account/orders/');

    // TODO: Error message needs to be translated
    await expect(page.getByText('The email address is already in use.')).toBeVisible();
  });
});
