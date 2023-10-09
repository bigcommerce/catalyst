import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('Base checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--base-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Focused checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--focused-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Checked checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--checked-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Disabled checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--disabled-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Disabled checked checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--disabled-checked-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Checkbox with label', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--checkbox-with-label`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Checkbox with custom icon', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/checkbox--checkbox-with-custom-icon`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator('#CheckboxWithCustomIcon')
    .click();
  await expect(page).toHaveScreenshot();
});
