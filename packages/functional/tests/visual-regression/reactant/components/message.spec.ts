import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Info message', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/message--info`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByText('Here is your message for Users'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Success message', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/message--success`);
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
