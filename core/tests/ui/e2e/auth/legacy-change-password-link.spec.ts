import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Legacy change_password login link redirects to the change password page', async ({
  page,
}) => {
  const t = await getTranslations('Auth.ChangePassword');

  await page.goto('/login/?action=change_password&c=1&t=abc123');

  await page.waitForURL(/\/change-password\/?\?c=1&t=abc123$/);
  await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();
});

test('Login link with an incomplete change_password action stays on the login page', async ({
  page,
}) => {
  const t = await getTranslations('Auth.Login');

  await page.goto('/login/?action=change_password&c=1');

  await expect(page.getByRole('heading', { name: t('heading') })).toBeVisible();
  await expect(page).toHaveURL(/\/login\/?\?action=change_password&c=1$/);
});
