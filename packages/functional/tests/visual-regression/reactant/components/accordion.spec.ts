import { test, expect } from '@playwright/test';

const accordionUrl = 'https://catalyst-storybook.vercel.app/?path=/docs/accordion--docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const collapseBtn = '#story--accordion--basic-example--primary-inner';

test('accordion', async ({ page }) => {
    await page.goto(accordionUrl);
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Accordion' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('accordion collapsed', async ({ page }) => {
    await page.goto(accordionUrl);
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Accordion' })).toBeVisible();
    await page.frameLocator(storyBookFrame).locator(collapseBtn).getByRole('button', { name: 'Brand' }).click();
    await expect(page).toHaveScreenshot();
});
