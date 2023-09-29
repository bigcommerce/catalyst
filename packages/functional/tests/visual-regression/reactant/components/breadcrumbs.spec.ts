import { test, expect } from '@playwright/test';

const breadCrumbsUrl = 'https://catalyst-storybook.vercel.app/?path=/docs/breadcrumbs--docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const breadCrumbsExample = '#anchor--breadcrumbs--example';

test('Breadcrumbs', async ({ page }) => {
    await page.goto(breadCrumbsUrl);
    await expect(page.frameLocator(storyBookFrame).locator(breadCrumbsExample)).toBeVisible();
    await expect(page).toHaveScreenshot();
});
