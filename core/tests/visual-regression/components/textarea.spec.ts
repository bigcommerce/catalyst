import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Textarea basic', async ({ page }) => {
  // Arrange
  await page.goto(routes.CONTACT_US);

  // Act
  const textarea = page.getByRole('textbox', { name: 'Comments/questions Required' });

  await textarea.waitFor();

  // Assert
  await expect(textarea).toHaveScreenshot();
});

test('Textarea error', async ({ page }) => {
  // Arrange
  await page.goto(routes.CONTACT_US);

  // Act
  await page.getByRole('button', { name: 'Submit form' }).waitFor();
  await page.getByRole('button', { name: 'Submit form' }).click();

  // Assert
  await expect(
    page.getByRole('textbox', { name: 'Comments/questions Required' }),
  ).toHaveScreenshot();
});
