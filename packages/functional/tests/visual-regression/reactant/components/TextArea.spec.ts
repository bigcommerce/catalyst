import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Text area default', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/textarea--default`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Text area success', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/textarea--success`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Text area error', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/textarea--error`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});
