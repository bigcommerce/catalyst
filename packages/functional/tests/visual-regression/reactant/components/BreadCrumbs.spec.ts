import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

const breadCrumbsExample = '#anchor--breadcrumbs--example';

test('Breadcrumbs', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/breadcrumbs--docs');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).locator(breadCrumbsExample)).toBeVisible();
    await expect(page).toHaveScreenshot();
});
