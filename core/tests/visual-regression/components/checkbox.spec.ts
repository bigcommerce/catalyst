import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Disabled checkbox', async () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Disabled checked checkbox', async () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Checkbox with error variant', async () => {});

test('Checked checkbox with label', async ({ page }) => {
  // Arrange
  await page.goto(routes.SHOP_ALL);

  // Act
  const checkbox = page.getByLabel('Common Good1 products');

  await checkbox.click();

  // Assert
  await expect(checkbox).toHaveScreenshot();
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Checkbox with custom icon', async () => {});
