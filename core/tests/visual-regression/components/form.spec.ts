import { expect, test } from '~/tests/fixtures';
import routes from '~/tests/routes';

test('Form', async ({ page }) => {
  // Arrange
  await page.goto(routes.CONTACT_US);

  // Act
  const form = page.getByRole('heading', { name: 'Contact Us' });

  await form.waitFor();

  // Assert
  await expect(form.locator('..').locator('..')).toHaveScreenshot();
});
