import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Five star rating', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/rating--five-star-rating`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Zero rating', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/rating--zero-rating`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Float rating', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/rating--float-rating`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
