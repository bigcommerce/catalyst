import { faker } from '@faker-js/faker';

import { expect, Page, test } from '~/tests/fixtures';

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();

async function waitForShippingForm(page: Page, isMobile: boolean) {
  // Wait for the shipping form to load as playwright can fill out the form faster than the form is loaded in.
  await page.waitForRequest('**/internalapi/v1/store/countries');
  await page
    .locator('.checkout-step--shipping .checkout-view-content[aria-busy="false"]')
    .waitFor();

  if (!isMobile) {
    // Redirected checkout auto focuses when the section changes on desktop devices, therefore we need to wait for it to be focused.
    await expect(page.getByLabel('First Name')).toBeFocused();
  }
}

async function enterShopperDetails(page: Page) {
  await page.getByLabel('First Name').pressSequentially(firstName);
  await page.getByLabel('Last Name').pressSequentially(lastName);
  await page.getByLabel('Company Name (Optional)').pressSequentially('BigCommerce');
  await page.getByLabel('Phone Number (Optional)').pressSequentially(faker.phone.number());
  await page
    .getByLabel('Address', { exact: true })
    .pressSequentially(faker.location.buildingNumber());
  await page.getByLabel('City').pressSequentially('Natick');
  await page.getByRole('combobox', { name: 'State/Province' }).selectOption('Massachusetts');
  await page.getByRole('textbox', { name: 'Postal Code' }).pressSequentially('01762');
  await expect(page.getByRole('button', { name: 'Continue' })).toContainText('Continue');

  await page.getByRole('heading', { name: 'Customer' }).waitFor();
  await page.getByRole('heading', { name: 'Shipping' }).waitFor();
  await page.getByRole('heading', { name: 'Billing' }).waitFor();
}

async function enterCreditCardDetails(page: Page) {
  await page
    .frameLocator('#bigpaypay-ccNumber iframe')
    .getByLabel('Credit Card Number')
    .fill('4111 1111 1111 1111');
  await page.frameLocator('#bigpaypay-ccExpiry iframe').getByPlaceholder('MM / YY').fill('02 / 27');
  await page
    .frameLocator('#bigpaypay-ccName iframe')
    .getByLabel('Name on Card')
    .fill(`${firstName} ${lastName}`);
  await page.frameLocator('#bigpaypay-ccCvv iframe').getByLabel('CVV').fill('211');
}

test.describe('desktop', () => {
  test('Complete checkout as a guest shopper', async ({ page, isMobile }) => {
    await page.goto('/laundry-detergent/');
    await expect(
      page.getByRole('heading', { level: 1, name: '[Sample] Laundry Detergent' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();
    await page.getByRole('link', { name: 'Cart Items 1' }).click();
    await page.getByRole('heading', { level: 1, name: 'Your cart' }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page
      .getByLabel('Email')
      .fill(faker.internet.email({ firstName, lastName, provider: 'example.com' }));

    await page.getByRole('button', { name: 'Continue' }).click();

    await waitForShippingForm(page, isMobile);
    await enterShopperDetails(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: 'Payment', exact: true }).waitFor();

    await enterCreditCardDetails(page);

    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: `Thank you ${firstName}!`, level: 1 }),
    ).toBeVisible();
  });

  test('Complete checkout as a logged in shopper', async ({ page, isMobile, account }) => {
    const customer = await account.create();

    await customer.login();

    await page.goto('/laundry-detergent/');
    await expect(
      page.getByRole('heading', { level: 1, name: '[Sample] Laundry Detergent' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();
    await page.getByRole('link', { name: 'Cart Items 1' }).click();
    await page.getByRole('heading', { level: 1, name: 'Your cart' }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    await waitForShippingForm(page, isMobile);
    await enterShopperDetails(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: 'Payment', exact: true }).waitFor();

    await enterCreditCardDetails(page);

    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: `Thank you ${firstName}!`, level: 1 }),
    ).toBeVisible();
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

  test('Complete checkout as a guest shopper', async ({ page, isMobile }) => {
    await page.goto('/laundry-detergent/');
    await expect(
      page.getByRole('heading', { level: 1, name: '[Sample] Laundry Detergent' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();
    await page.getByRole('link', { name: 'Cart Items 1' }).click();
    await page.getByRole('heading', { level: 1, name: 'Your cart' }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page
      .getByLabel('Email')
      .fill(faker.internet.email({ firstName, lastName, provider: 'example.com' }));
    await page.getByRole('button', { name: 'Continue' }).click();

    await waitForShippingForm(page, isMobile);
    await enterShopperDetails(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: 'Payment', exact: true }).waitFor();

    await enterCreditCardDetails(page);

    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: `Thank you ${firstName}!`, level: 1 }),
    ).toBeVisible();
  });
});
