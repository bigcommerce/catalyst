import { faker } from '@faker-js/faker';

import { expect, Page, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

async function selectCountry(page: Page) {
  const countryInput = page.locator('#countryCodeInput');
  const countryInputValues = await Promise.all(
    (await countryInput.getByRole('option').all()).map((o) => o.getAttribute('value')),
  );
  const countryCodes = countryInputValues.filter(
    (value): value is string => value !== null && value !== '',
  );

  await countryInput.selectOption(faker.helpers.arrayElement(countryCodes));
}

async function selectState(page: Page) {
  const stateSelector = page.locator('#provinceCodeInput');

  if (await stateSelector.isVisible()) {
    const stateInputValues = await Promise.all(
      (await stateSelector.getByRole('option').all()).map((o) => o.getAttribute('value')),
    );
    const stateCodes = stateInputValues.filter(
      (value): value is string => value !== null && value !== '',
    );

    await stateSelector.selectOption(faker.helpers.arrayElement(stateCodes));
  } else {
    const stateInput = page.locator('#provinceInput');

    await stateInput.fill(faker.location.state());
  }
}

async function selectShippingMethod(page: Page) {
  await page.locator('label[for*="shippingOptionRadio"]').first().waitFor({ state: 'visible' });

  const shippingSelector = await page.locator('label[for*="shippingOptionRadio"]').all();

  await faker.helpers.arrayElement(shippingSelector).click();
  await page.waitForLoadState('networkidle');
}

async function enterAddressDetails(page: Page) {
  await page.locator('#firstNameInput').fill(faker.person.firstName());
  await page.locator('#lastNameInput').fill(faker.person.lastName());
  await page.locator('#addressLine1Input').fill(faker.location.streetAddress());
  await page.locator('#addressLine2Input').fill(faker.location.secondaryAddress());
  await page.locator('#cityInput').fill(faker.location.city());
  await selectCountry(page);
  await selectState(page);
  await page.locator('#postCodeInput').fill(faker.location.zipCode('#####'));
  await selectShippingMethod(page);
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
}

async function enterPaymentDetails(page: Page) {
  await page.locator('label[for="radio-bigpaypay"]').click();

  const iframeCcNumber = page.frameLocator('#bigpaypay-ccNumber iframe').locator('#card-number');
  const ccNumber = page.locator('#ccNumber');
  const iframeCcExpiry = page.frameLocator('#bigpaypay-ccExpiry iframe').locator('#card-expiry');
  const ccExpiry = page.locator('#ccExpiry');
  const iframeCcName = page.frameLocator('#bigpaypay-ccName iframe').locator('#card-name');
  const ccName = page.locator('#ccName');
  const iframeCcCvc = page.frameLocator('#bigpaypay-ccCvv iframe').locator('#card-code');
  const ccCvc = page.locator('#ccCvv');

  await iframeCcNumber.or(ccNumber).fill('4111 1111 1111 1111');
  await iframeCcExpiry.or(ccExpiry).fill('12/30');
  await iframeCcName.or(ccName).fill('success'); // BC test payment gateway requires 'success' as name
  await iframeCcCvc.or(ccCvc).fill('123');
}

test('Checkout works as a guest shopper', async ({ page, catalog }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('Product.ProductDetails.successMessage', {
    cartItems: 1,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();

  await page.goto('/cart');
  await page.getByRole('button', { name: t('Cart.proceedToCheckout') }).click();
  await page.waitForURL('**/checkout');

  await page
    .locator('input[name="email"]')
    .fill(faker.internet.email({ provider: 'test.catalyst' }));
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');

  await enterAddressDetails(page);
  await enterPaymentDetails(page);

  // Complete order
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');

  expect(page.url()).toContain('/checkout/order-confirmation');
});
