import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Basic sheet', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/sheet--basic`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator(storyBookElements.storyBook)
    .getByRole('button', { name: 'Open' })
    .click();
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .getByRole('heading', { name: 'Categories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Sheet with overlay', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/sheet--with-overlay`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator(storyBookElements.storyBook)
    .getByRole('button', { name: 'Open' })
    .click();
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .getByRole('heading', { name: 'Sheet w/ Overlay' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Sheet with footer', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/sheet--with-footer`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .locator(storyBookElements.storyBook)
    .getByRole('button', { name: 'Open' })
    .click();
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .getByRole('heading', { name: 'Sheet w/ Footer' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
