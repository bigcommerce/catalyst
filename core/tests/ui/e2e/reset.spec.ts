import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';

const email = faker.internet.email({ provider: 'mybigcommerce.com' });

test('Reset password', async ({ page }) => {
  await page.goto('/reset');

  await page.getByRole('heading', { name: 'Reset password' }).waitFor();

  await page.getByLabel('Email').fill(email);

  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(page).toHaveURL('/login/');
  await expect(page.getByRole('region')).toHaveText(
    `If the email address ${email} is linked to an account in our store, we have sent you a password reset email. Please check your inbox and spam folder if you don't see it.`,
  );
});
