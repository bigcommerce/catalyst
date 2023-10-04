import { test, expect } from '@playwright/test';

const sheetUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Basic sheet', async ({ page }) => {
    await page.goto(`${sheetUrl}/sheet--basic`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await page.frameLocator(storyBookFrame).locator(storyBook).getByRole('button', { name: 'Open' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Categories' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Sheet with overlay', async ({ page }) => {
    await page.goto(`${sheetUrl}/sheet--with-overlay`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await page.frameLocator(storyBookFrame).locator(storyBook).getByRole('button', { name: 'Open' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Sheet w/ Overlay' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Sheet with footer', async ({ page }) => {
    await page.goto(`${sheetUrl}/sheet--with-footer`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await page.frameLocator(storyBookFrame).locator(storyBook).getByRole('button', { name: 'Open' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Sheet w/ Footer' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});



