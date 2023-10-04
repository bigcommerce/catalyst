import { test, expect } from '@playwright/test';

const swatchUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Swatch basic example', async ({ page }) => {
    await page.goto(`${swatchUrl}/swatch--basic-example`);
    await expect(page.frameLocator(storyBookFrame).getByLabel('Color')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
