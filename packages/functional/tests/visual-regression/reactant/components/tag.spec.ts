import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Tag basic example', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/tag--basic-example`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(page.frameLocator(storyBookElements.storyBookFrame).getByText('Tag')).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Tag no action example', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/tag--no-action-example`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(page.frameLocator(storyBookElements.storyBookFrame).getByText('Tag')).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
