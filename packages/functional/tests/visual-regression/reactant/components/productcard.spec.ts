import { test, expect } from '@playwright/test';

const productCardUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Basic product card', async ({ page }) => {
    await page.goto(`${productCardUrl}/productcard--basic-example`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});


