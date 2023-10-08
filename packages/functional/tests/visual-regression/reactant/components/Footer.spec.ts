import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

test('Basic footer', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/footer--basic-example');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook).getByLabel('Footer navigation')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Multi low footer', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/footer--multi-row-footer-nav');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook).getByLabel('Footer navigation')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
