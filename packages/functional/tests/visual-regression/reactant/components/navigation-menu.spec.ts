import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Basic navigation', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--basic-example`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Navigation alignment left', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--navigation-alignment-left`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Navigation alignment right', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--navigation-alignment-right`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Logo centered', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--logo-centered`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Bottom navigation left', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--bottom-navigation-left`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Bottom navigation center', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--bottom-navigation-center`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Bottom navigation right', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--bottom-navigation-right`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Navigation with badge', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--navigation-with-badge`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Custom navigation menu toggle', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/navigation-menu--custom-navigation-menu-toggle`);
  await page.getByRole('button', { name: 'Go full screen [F]' }).click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Accessories' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
