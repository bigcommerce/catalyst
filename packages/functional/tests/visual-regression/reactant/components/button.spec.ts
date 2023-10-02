import { test, expect } from '@playwright/test';

const buttonUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const primaryButton = '#storybook-root';

test('Primary button', async ({ page }) => {
    await page.goto(`${buttonUrl}/button--primary`);
    await expect(page.frameLocator(storyBookFrame).locator(primaryButton)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Secondary button', async ({ page }) => {
    await page.goto(`${buttonUrl}/button--secondary`);
    await expect(page.frameLocator(storyBookFrame).locator(primaryButton)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('As a child', async ({ page }) => {
    await page.goto(`${buttonUrl}/button--as-child`);
    await expect(page.frameLocator(storyBookFrame).locator(primaryButton)).toBeVisible();
    await expect(page).toHaveScreenshot();
});
