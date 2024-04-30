import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Base checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--base-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Focused checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--focused-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Checked checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--checked-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Disabled checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--disabled-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Disabled checked checkbox', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--disabled-checked-checkbox`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Checkbox with error variant', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--error`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Checkbox with label', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--checkbox-with-label`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Checkbox with custom icon', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/checkbox--checkbox-with-custom-icon`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator('#CheckboxWithCustomIcon')
    .click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
