import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

const collapseBtn = '#story--accordion--basic-example--primary-inner';

test('accordion', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/accordion--docs');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByRole('heading', { name: 'Accordion' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('accordion collapsed', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/accordion--docs');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByRole('heading', { name: 'Accordion' })).toBeVisible();
    await page.frameLocator(storyBookElements.storyBookFrame).locator(collapseBtn).getByRole('button', { name: 'Brand' }).click();
    await expect(page).toHaveScreenshot();
});
