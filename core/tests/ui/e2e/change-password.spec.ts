import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';

// Prefix is added to ensure that the password requirements are met
const password = faker.internet.password({ pattern: /[a-zA-Z0-9]/, prefix: '1At', length: 10 });

test('Change password', async ({ page }) => {
  await page.goto('/change-password?c=123&t=test123');

  await page.getByRole('heading', { name: 'Change password' }).waitFor();

  await page.getByLabel('New passwordRequired', { exact: true }).fill(password);
  await page.getByLabel('Confirm passwordRequired').fill(password);

  await page.getByRole('button', { name: 'Change password' }).click();

  await expect(page.getByRole('region')).toHaveText(
    'Invalid password reset token or customerEntityId.',
  );
});
