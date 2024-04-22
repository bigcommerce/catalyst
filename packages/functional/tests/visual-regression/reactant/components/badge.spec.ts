import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('badge', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/badge--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('badge zoomed', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/badge--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
