import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Text area default', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/text-area--default`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Text area success', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/text-area--success`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Text area error', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/text-area--error`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
