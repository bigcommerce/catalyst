import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';

const sampleProduct = '[Sample] Laundry Detergent';
const testUser = faker.person.firstName();
const actionTimeout = 10000;

async function enterShopperDetails(page: Page) {
  await page.getByLabel('First Name').fill(testUser, { timeout: actionTimeout });
  await page.getByLabel('Last Name').fill(faker.person.lastName(), { timeout: actionTimeout });
  await page.getByLabel('Company Name (Optional)').fill('BigCommerce', { timeout: actionTimeout });
  await page
    .getByLabel('Phone Number (Optional)')
    .fill(faker.phone.number(), { timeout: actionTimeout });
  await page
    .getByLabel('Address', { exact: true })
    .fill(faker.location.buildingNumber(), { timeout: actionTimeout });
  await page.getByLabel('City').fill('Natick', { timeout: actionTimeout });
  await page.getByRole('combobox', { name: 'State/Province' }).selectOption('Massachusetts');
  await page.getByRole('textbox', { name: 'Postal Code' }).fill('01762');
  await expect(page.getByRole('button', { name: 'Continue' })).toContainText('Continue');

  await page.getByRole('heading', { name: 'Customer' }).waitFor();
  await page.getByRole('heading', { name: 'Shipping' }).waitFor();
  await page.getByRole('heading', { name: 'Billing' }).waitFor();
}

async function enterCreditCardDetails(page: Page) {
  await page
    .frameLocator('#bigpaypay-ccNumber iframe')
    .getByLabel('Credit Card Number')
    .fill('4111 1111 1111 1111', { timeout: actionTimeout });
  await page.frameLocator('#bigpaypay-ccExpiry iframe').getByPlaceholder('MM / YY').fill('02 / 27');
  await page.frameLocator('#bigpaypay-ccName iframe').getByLabel('Name on Card').fill(testUser);
  await page.frameLocator('#bigpaypay-ccCvv iframe').getByLabel('CVV').fill('211');
}

test.describe(() => {
  // Typing into many form fields has made this test a little flaky. Retry failing test until we
  // fix the test
  test.describe.configure({ retries: 2 });

  test('Complete checkout as a guest shopper', async ({ page }) => {
    await page.goto('/laundry-detergent/');
    await expect(page.getByRole('heading', { level: 1, name: sampleProduct })).toBeVisible();

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('link', { name: 'Cart Items 1' }).click();
    await page.getByRole('heading', { level: 1, name: 'Your cart' }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page.getByLabel('Email').fill(faker.internet.email());
    await page.getByRole('button', { name: 'Continue' }).click();

    await enterShopperDetails(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: 'Payment', exact: true }).waitFor();

    await enterCreditCardDetails(page);

    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: `Thank you ${testUser}!`, level: 1 }),
    ).toBeVisible();
  });

  test('Complete checkout as a logged in shopper', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login/');
    await page.getByLabel('Login').click();
    await page.getByLabel('Email').fill(process.env.TEST_ACCOUNT_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.TEST_ACCOUNT_PASSWORD || '');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('heading', { name: 'My Account' }).waitFor();

    await page.goto('/laundry-detergent/');
    await expect(page.getByRole('heading', { level: 1, name: sampleProduct })).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('link', { name: 'Cart Items 1' }).click();
    await page.getByRole('heading', { level: 1, name: 'Your cart' }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    await enterShopperDetails(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: 'Payment', exact: true }).waitFor();

    await enterCreditCardDetails(page);

    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: `Thank you ${testUser}!`, level: 1 }),
    ).toBeVisible();
  });
});
