import { faker } from '@faker-js/faker';
import { Browser } from '@playwright/test';

import { testEnv } from '~/tests/environment';
import { expect, test } from '~/tests/fixtures';
import { CustomerFixture } from '~/tests/fixtures/customer';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const bold = (chunks: React.ReactNode) => chunks;

async function logoutInSeparateBrowser(fixture: CustomerFixture, browser: Browser) {
  return test.step('Sign out in a different browser window', async () => {
    const newBrowser = await browser.newContext();
    const newPage = await newBrowser.newPage();
    const customer = fixture.withNewPage(newPage);

    await customer.login();
    await newPage.goto('/account/wishlists/');
    await newPage.waitForURL('/account/wishlists/');

    await newPage.goto('/logout', { waitUntil: 'networkidle' });
    await newPage.close();
  });
}

test.describe('Account wishlists', () => {
  test(
    'Creating a new wishlist works as expected',
    { tag: [TAGS.writesData] },
    async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id } = await customer.login();

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      await page.getByRole('button', { name: t('new'), exact: true }).click();

      const wishlistName = `Wishlist ${faker.string.alpha(10)}`;

      await page.getByLabel(t('Form.nameLabel')).fill(wishlistName);
      await page.getByRole('button', { name: t('Modal.create') }).click();
      await expect(page.getByText(t('Result.createSuccess'))).toBeVisible();

      const locator = page.getByRole('region', { name: wishlistName });

      await expect(locator.getByText(wishlistName)).toBeVisible();

      await customer.deleteAllWishlists(id);
    },
  );

  test('Creating a new wishlist disallows empty names', async ({ page, customer }) => {
    const t = await getTranslations('Wishlist');

    await customer.login();

    await page.goto('/account/wishlists/');
    await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

    await page.getByRole('button', { name: t('new'), exact: true }).click();
    await page.getByLabel(t('Form.nameLabel')).fill('');
    await page.getByRole('button', { name: t('Modal.create') }).click();
    await expect(page.getByText(t('Errors.nameRequired'))).toBeVisible();
  });

  test('Wishlists page displays empty state when there are no wishlists', async ({
    page,
    customer,
  }) => {
    const t = await getTranslations('Wishlist');
    const { id } = await customer.login();

    await customer.deleteAllWishlists(id);

    await page.goto('/account/wishlists/');
    await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: t('noWishlists'), exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: t('new'), exact: true })).toBeVisible();
    await expect(page.getByText(t('noWishlistsSubtitle'), { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: t('noWishlistsCallToAction'), exact: true }),
    ).toBeVisible();
  });

  test('Wishlists page displays each wishlist correctly', async ({ page, customer }) => {
    const t = await getTranslations('Wishlist');
    const { id: customerId } = await customer.login();
    const wishlist1 = await customer.createWishlist({
      customerId,
      isPublic: true,
    });

    const wishlist2 = await customer.createWishlist({ customerId });

    await page.goto('/account/wishlists/');
    await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

    const wishlist1Locator = page.getByRole('region', { name: wishlist1.name });
    const wishlist2Locator = page.getByRole('region', { name: wishlist2.name });

    await expect(wishlist1Locator.getByText(wishlist1.name)).toBeVisible();
    await expect(wishlist1Locator.getByText(t('Visibility.public'))).toBeVisible();
    await expect(wishlist1Locator.getByRole('link', { name: t('viewWishlist') })).toBeVisible();
    await expect(wishlist1Locator.getByRole('button', { name: t('actionsTitle') })).toBeVisible();
    await expect(wishlist1Locator.getByText(t('emptyWishlist'))).toBeVisible();

    await expect(wishlist2Locator.getByText(wishlist2.name)).toBeVisible();
    await expect(wishlist2Locator.getByText(t('Visibility.private'))).toBeVisible();
    await expect(wishlist2Locator.getByRole('link', { name: t('viewWishlist') })).toBeVisible();
    await expect(wishlist2Locator.getByRole('button', { name: t('actionsTitle') })).toBeVisible();
    await expect(wishlist2Locator.getByText(t('emptyWishlist'))).toBeVisible();
  });

  test.describe('Wishlist actions menu', () => {
    test('Wishlist actions menu displays all actions', async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await expect(page.getByRole('menuitem', { name: t('share') })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: t('rename') })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: t('makePublic') })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: t('delete') })).toBeVisible();
    });

    test('Share wishlist action is enabled, displays the correct URL for a public wishlist, and copies the URL to clipboard', async ({
      page,
      customer,
    }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name, token } = await customer.createWishlist({
        customerId,
        isPublic: true,
      });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('share') }).click();

      const expectedUrl = `${testEnv.PLAYWRIGHT_TEST_BASE_URL}/wishlist/${token}`;

      await expect(page.getByText(t('Modal.shareTitle', { name }))).toBeVisible();
      await expect(page.getByRole('textbox')).toHaveValue(expectedUrl);

      await page.getByRole('button', { name: t('Modal.copy') }).click();
      await expect(page.getByText(t('shareCopied'))).toBeVisible();

      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

      expect(clipboardText).toBe(expectedUrl);
    });

    test('Share wishlist action is disabled for a private wishlist', async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await expect(page.getByRole('menuitem', { name: t('share') })).toBeDisabled();
    });

    test('Rename wishlist action renames a wishlist successfully', async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('rename') }).click();

      await expect(
        page.getByRole('heading', { name: t('Modal.renameTitle', { name }) }),
      ).toBeVisible();

      await expect(page.getByLabel(t('Form.nameLabel'))).toHaveValue(name);

      const newName = `${name} (renamed)`;

      await page.getByLabel(t('Form.nameLabel')).fill(newName);
      await page.getByRole('button', { name: t('Modal.save') }).click();

      await expect(page.getByText(t('Result.updateSuccess'))).toBeVisible();
      await expect(page.getByRole('region').filter({ hasText: newName })).toBeVisible();
    });

    test('Rename wishlist action disallows empty names', async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('rename') }).click();

      await page.getByLabel(t('Form.nameLabel')).fill('');
      await page.getByRole('button', { name: t('Modal.save') }).click();

      await expect(page.getByText(t('Errors.nameRequired'))).toBeVisible();
    });

    test('Rename wishlist action fails if the user is no longer logged in', async ({
      page,
      browser,
      customer,
    }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      await logoutInSeparateBrowser(customer, browser);

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('rename') }).click();
      await page.getByLabel(t('Form.nameLabel')).fill(`${name} (renamed)`);
      await page.getByRole('button', { name: t('Modal.save') }).click();

      await expect(page.getByText(t('Errors.unauthorized'))).toBeVisible();
    });

    test('Public/private wishlist action toggles visibility', async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({
        customerId,
        isPublic: false,
      });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await expect(locator.getByText(t('Visibility.private'))).toBeVisible();
      await locator.getByRole('button', { name: t('actionsTitle') }).click();

      await page.getByRole('menuitem', { name: t('makePublic') }).click();

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const makePublicContent = t.rich('Modal.makePublicContent', {
        name,
        bold,
      }) as string;

      await expect(page.getByText(makePublicContent)).toBeVisible();
      await page.getByRole('button', { name: t('makePublic') }).click();
      await expect(page.getByText(t('Result.updateSuccess'))).toBeVisible();
      await expect(locator.getByText(t('Visibility.public'))).toBeVisible();

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('makePrivate') }).click();

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const makePrivateContent = t.rich('Modal.makePrivateContent', {
        name,
        bold,
      }) as string;

      await expect(page.getByText(makePrivateContent)).toBeVisible();
      await page.getByRole('button', { name: t('makePrivate') }).click();
      await expect(page.getByText(t('Result.updateSuccess'))).toBeVisible();
      await expect(locator.getByText(t('Visibility.private'))).toBeVisible();
    });

    test('Public/private wishlist action fails if the user is no longer logged in', async ({
      page,
      browser,
      customer,
    }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      await logoutInSeparateBrowser(customer, browser);

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('makePublic') }).click();
      await page.getByRole('button', { name: t('makePublic') }).click();

      await expect(page.getByText(t('Errors.unauthorized'))).toBeVisible();
    });

    test('Delete wishlist action deletes a wishlist successfully', async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('delete') }).click();

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const deleteContent = t.rich('Modal.deleteContent', {
        name,
        bold,
      }) as string;

      await expect(page.getByText(deleteContent)).toBeVisible();

      await page.getByRole('button', { name: t('Modal.delete') }).click();
      await expect(page.getByText(t('Result.deleteSuccess'))).toBeVisible();
      await expect(locator).not.toBeVisible();
    });

    test('Delete wishlist action fails if the user is no longer logged in', async ({
      page,
      browser,
      customer,
    }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { name } = await customer.createWishlist({ customerId });

      await page.goto('/account/wishlists/');
      await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();

      await logoutInSeparateBrowser(customer, browser);

      const locator = page.getByRole('region', { name });

      await locator.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('delete') }).click();
      await page.getByRole('button', { name: t('Modal.delete') }).click();

      await expect(page.getByText(t('Errors.unauthorized'))).toBeVisible();
    });
  });
});
