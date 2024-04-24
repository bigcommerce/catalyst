import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Primary button', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/button--primary`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Secondary button', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/button--secondary`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('As a child', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/button--as-child`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
