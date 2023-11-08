import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Default message', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/message--default`);
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .getByText('Here is your message for Users on Successful Action'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Error message', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/message--error`);
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .getByText('Here is your message for Users on Failed Action'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
