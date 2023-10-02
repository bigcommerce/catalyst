import { test, expect } from '@playwright/test';

const footerUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Basic footer', async ({ page }) => {
    await page.goto(`${footerUrl}/footer--basic-example`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook).getByLabel('Footer navigation')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Multi low footer', async ({ page }) => {
    await page.goto(`${footerUrl}/footer--multi-row-footer-nav`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook).getByLabel('Footer navigation')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
