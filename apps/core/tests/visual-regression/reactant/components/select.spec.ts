import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Default select', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/select--default`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Select with disabled items', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/select--disabled-items`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator(storyBookElements.storyBook)
    .getByRole('combobox')
    .click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
