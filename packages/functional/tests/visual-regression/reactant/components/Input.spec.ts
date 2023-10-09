import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Default input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--default`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Disabled input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--disabled`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Success input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--success`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Error input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--error`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Custom icon input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--custom-icon`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});
