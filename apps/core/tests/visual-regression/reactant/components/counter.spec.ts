import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Counter default', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/counter--default`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator(storyBookElements.storyBook)
    .getByLabel('Increase count')
    .click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Counter disabled', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/counter--disabled`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
