import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

const docsSlides = '#story--carousel--multiple-slides--primary-inner';

test('Docs', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/carousel--docs`);
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .locator(docsSlides)
      .getByRole('heading', { name: 'Related Products' }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Multiple slides', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/carousel--multiple-slides`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Related Products'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Single slide', async ({ page }) => {
  await page.goto(`${storyBookElements.docsUrl}/carousel--single-slide`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Related Products'),
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});
