import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Default input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--default`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Disabled input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--disabled`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Success input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--success`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Error input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--error`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Custom icon input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/input--custom-icon`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByPlaceholder('Placeholder...'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
