import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('accordion', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/accordion--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('accordion collapsed', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/accordion--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .getByRole('button', { name: 'Brand' })
    .click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
