import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Multiple slides', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/carousel--multiple-slides`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Related Products'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Single slide', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/carousel--single-slide`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Related Products'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});
