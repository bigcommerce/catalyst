import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Forgot password form works as expected', async ({ page }) => {
  const t = await getTranslations('Auth.Login.ForgotPassword');
  const email = faker.internet.email({ provider: 'example.com' });

  await page.goto('/login/forgot-password');
  await page.getByRole('heading', { name: t('title') }).waitFor();

  // TODO: Forgot password form fields and CTA need to be translated
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(page.getByText(t('confirmResetPassword', { email }))).toBeVisible();
});

test('Forgot password form displays error if email is not valid', async ({ page }) => {
  const t = await getTranslations('Auth.Login.ForgotPassword');

  await page.goto('/login/forgot-password');
  await page.getByRole('heading', { name: t('title') }).waitFor();

  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Reset password' }).click();

  // TODO: Forgot password form error message needs to be translated
  await expect(page.getByText('Please enter a valid email.')).toBeVisible();
});
