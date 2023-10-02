import { test, expect } from '@playwright/test';

const navigationMenuUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Basic navigation', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--basic-example`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Navigation alignment left', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--navigation-alignment-left`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Navigation alignment right', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--navigation-alignment-right`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Logo centered', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--logo-centered`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Bottom navigation left', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--bottom-navigation-left`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Bottom navigation center', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--bottom-navigation-center`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Bottom navigation right', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--bottom-navigation-right`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Navigation with badge', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--navigation-with-badge`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Custom navigation menu toggle', async ({ page }) => {
    await page.goto(`${navigationMenuUrl}/navigationmenu--custom-navigation-menu-toggle`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});
