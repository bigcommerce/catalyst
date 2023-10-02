import { test, expect } from '@playwright/test';

const radioGroupUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Base radio group', async ({ page }) => {
    await page.goto(`${radioGroupUrl}/radiogroup--base-radio-group`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Radio group with icon', async ({ page }) => {
    await page.goto(`${radioGroupUrl}/radiogroup--radio-group-with-icon`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});


