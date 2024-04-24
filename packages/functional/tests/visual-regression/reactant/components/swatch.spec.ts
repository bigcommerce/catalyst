import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Swatch basic example', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/swatch--basic-example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Color'),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
