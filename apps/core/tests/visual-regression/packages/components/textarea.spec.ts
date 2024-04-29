import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Textarea basic', async ({ page }) => {
  await page.goto(routes.CONTACT_US);
  await expect(page.getByRole('button', { name: 'Submit form' })).toBeVisible();

  expect(
    await page.getByRole('textbox', { name: 'Comments/questions Required' }).screenshot(),
  ).toMatchSnapshot();
});

test('Textarea error', async ({ page }) => {
  await page.goto(routes.CONTACT_US);
  await expect(page.getByRole('button', { name: 'Submit form' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit form' }).click();

  await expect(
    page.getByRole('textbox', { name: 'Comments/questions Required' }),
  ).toHaveScreenshot();
});
