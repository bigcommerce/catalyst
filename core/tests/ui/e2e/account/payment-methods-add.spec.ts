import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

const DEFAULT_CARD_PAYMENT_METHOD_ID = 'braintree.card';
const ADD_PAYMENT_METHOD_URL = `/account/payment-methods/add/${DEFAULT_CARD_PAYMENT_METHOD_ID}/`;

test(`${ADD_PAYMENT_METHOD_URL} is restricted for guest users`, async ({ page }) => {
  await page.goto(ADD_PAYMENT_METHOD_URL);
  await expect(page).toHaveURL('/login/');
});

test('Authenticated shopper sees the default credit card vaulting form', async ({
  page,
  customer,
}) => {
  const t = await getTranslations('Account.PaymentMethods.Add');

  await customer.login();
  await page.goto(ADD_PAYMENT_METHOD_URL);

  await expect(page.getByRole('heading', { name: t('title'), level: 1 })).toBeVisible();

  // The microapp's own two subsection headings — not Catalyst-translated strings, so matched
  // literally here rather than via `getTranslations`
  await expect(page.getByText('Payment method', { exact: true })).toBeVisible();
  await expect(page.getByText('Billing address', { exact: true })).toBeVisible();

  // Each hosted card field in the microapp source has its own container
  await expect(page.locator('#cardNumber iframe')).toBeVisible();
  await expect(page.locator('#cardExpiry iframe')).toBeVisible();
  await expect(page.locator('#cardCode iframe')).toBeVisible();
  await expect(page.locator('#cardName iframe')).toBeVisible();

  // Plain billing address fields rendered by the same form.
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="address1"]')).toBeVisible();
  await expect(page.locator('input[name="city"]')).toBeVisible();
  await expect(page.locator('select[name="countryCode"]')).toBeVisible();
  await expect(page.locator('input[name="postalCode"]')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Save Payment Method' })).toBeVisible();
});

test(
  'Vaulting a default credit card redirects to the (not yet built) payment methods list',
  { tag: [TAGS.writesData] },
  async ({ page, customer }) => {
    await customer.login();
    await page.goto(ADD_PAYMENT_METHOD_URL);

    await expect(page.locator('#cardNumber iframe')).toBeVisible();

    const realInput = (containerId: string) =>
      page.frameLocator(`#${containerId} iframe`).locator('input:not([tabindex="-1"])');

    await realInput('cardNumber').fill('4111111111111111');
    await realInput('cardExpiry').fill('12/30');
    await realInput('cardCode').fill('123');
    await realInput('cardName').fill(faker.person.fullName());

    await page.locator('input[name="firstName"]').fill(faker.person.firstName());
    await page.locator('input[name="lastName"]').fill(faker.person.lastName());
    await page.locator('input[name="address1"]').fill(faker.location.streetAddress());
    await page.locator('input[name="city"]').fill(faker.location.city());
    await page.locator('select[name="countryCode"]').selectOption({ label: 'United States' });
    await page.locator('input[name="postalCode"]').fill(faker.location.zipCode('#####'));

    await page.getByRole('button', { name: 'Save Payment Method' }).click();

    // On success, the microapp does a full-page `window.location.href` navigation to
    // `paymentMethodsUrl` (`/account/payment-methods/`), which Catalyst hasn't built yet
    // Landing on the 404 page is therefore the expected outcome.
    // TODO: Replace this with the actual payment methods list page once it's built.
    await expect(page).toHaveURL('/account/payment-methods/');

    const t = await getTranslations();

    await expect(page.getByRole('heading', { name: t('NotFound.title') })).toBeVisible();
  },
);
