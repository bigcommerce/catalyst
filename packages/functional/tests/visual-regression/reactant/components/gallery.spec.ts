import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Gallery example', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-skip-toolbar': '1' });
  await page.goto(`${storyBookElements.storyUrl}/gallery--example`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Thumbnail navigation'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Custom image gallery', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-skip-toolbar': '1' });
  await page.goto(`${storyBookElements.storyUrl}/gallery--custom-image-element`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Thumbnail navigation'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
