import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Label example', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/label--example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByText('Label'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Label with input', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/label--with-input`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Label'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
