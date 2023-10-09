import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Base radio group', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/radiogroup--base-radio-group`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Radio group with icon', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/radiogroup--radio-group-with-icon`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});
