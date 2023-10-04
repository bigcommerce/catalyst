import { test, expect } from '@playwright/test';

const rectangleListUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Basic rectangle list', async ({ page }) => {
    await page.goto(`${rectangleListUrl}/rectanglelist--basic-example`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});



