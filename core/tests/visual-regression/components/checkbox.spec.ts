import { expect, test } from '~/tests/fixtures';
import routes from '~/tests/routes';

test('Checked checkbox with label', async ({ page }) => {
  // Arrange
  await page.goto(routes.SHOP_ALL);

  // Act
  const checkbox = page.getByLabel('Common Good1 products');

  await checkbox.click();

  // Assert
  await expect(checkbox).toHaveScreenshot();
});
