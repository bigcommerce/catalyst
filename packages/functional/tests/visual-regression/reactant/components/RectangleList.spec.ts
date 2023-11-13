import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Basic rectangle list', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/rectanglelist--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
