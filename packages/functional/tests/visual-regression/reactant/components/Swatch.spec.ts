import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

test('Swatch basic example', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/swatch--basic-example');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Color')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
