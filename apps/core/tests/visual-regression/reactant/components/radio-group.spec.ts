import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Base radio group', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/radio-group--base-radio-group`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Radio group with error variant', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/radio-group--error`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Radio group with icon', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/radio-group--radio-group-with-icon`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
