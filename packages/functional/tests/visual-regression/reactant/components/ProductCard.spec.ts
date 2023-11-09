import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Basic product card', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/productcard--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
