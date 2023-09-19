import { test, expect } from '@playwright/test';
import { CATALYST_HOME_PAGE } from '../src/global-constants';

test('has title', async ({ page }) => {
    await page.goto(CATALYST_HOME_PAGE);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Catalyst Store/);
});
