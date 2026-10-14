import { faker } from '@faker-js/faker';

import { testEnv } from '~/tests/environment';
import { expect, type Page, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

const DEFAULT_CARD_PAYMENT_METHOD_ID = 'braintree.card';
const ADD_PAYMENT_METHOD_URL = `/account/payment-methods/add/${DEFAULT_CARD_PAYMENT_METHOD_ID}/`;
const ADD_PAYMENT_METHOD_URL_REQUIRING_INIT = `${ADD_PAYMENT_METHOD_URL}?init=1`;
const VAULT_INITIALIZATION_PATH = '/api/account/vault-initialization';
const INITIALIZATION_REQUIRED_PAYMENT_METHOD_ID = 'squarev2.card';
const SQUARE_ADD_PAYMENT_METHOD_URL = `/account/payment-methods/add/${INITIALIZATION_REQUIRED_PAYMENT_METHOD_ID}/?init=1`;
const SQUARE_TEST_CARD = {
  number: '4111111111111111',
  expiry: '12/30',
  cvv: '111',
  postalCode: '94103',
  state: 'California',
};
const STRIPE_PAYMENT_METHOD_ID = 'stripeocs.credit_card';
const STRIPE_ADD_PAYMENT_METHOD_URL = `/account/payment-methods/add/${STRIPE_PAYMENT_METHOD_ID}/?init=1`;
const STRIPE_TEST_CARD = {
  number: '4242424242424242',
  expiry: '12/30',
  cvc: '123',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function getVaultClientConfiguration(
  page: Page,
  paymentMethodId: string,
): Promise<Record<string, unknown> | undefined> {
  const response = await page.request.get(
    `${VAULT_INITIALIZATION_PATH}?paymentMethodId=${paymentMethodId}`,
  );

  // A 500 may indicate the provider is either unconfigured or not vault-capable, so it reads as absent.
  if (response.status() === 500) {
    return undefined;
  }

  if (!response.ok()) {
    throw new Error(
      `Vault initialization for ${paymentMethodId} failed with status ${response.status()}, which does not indicate an unconfigured provider.`,
    );
  }

  const body: unknown = await response.json();

  if (
    !isRecord(body) ||
    !isRecord(body.paymentProviderInitializationData) ||
    !isRecord(body.paymentProviderInitializationData.clientConfiguration)
  ) {
    throw new Error(
      `Vault initialization for ${paymentMethodId} returned 200 without a client configuration.`,
    );
  }

  return body.paymentProviderInitializationData.clientConfiguration;
}

function watchForVaultRateLimit(page: Page): () => boolean {
  let rateLimited = false;

  page.on('response', (response) => {
    if (response.url().includes('/stored_instruments') && response.status() === 429) {
      rateLimited = true;
    }
  });

  return () => rateLimited;
}

// On success, the microapp does a full-page `window.location.href` navigation to
// `paymentMethodsUrl` (`/account/payment-methods/`), which Catalyst hasn't built yet
// Landing on the 404 page is therefore the expected outcome.
// TODO: Replace this with the actual payment methods list page once it's built.
async function saveAndExpectPaymentMethodsRedirect(page: Page): Promise<void> {
  const wasRateLimited = watchForVaultRateLimit(page);

  await page.getByRole('button', { name: 'Save Payment Method' }).click();

  try {
    await expect(page).toHaveURL('/account/payment-methods/');
  } catch (error) {
    if (wasRateLimited()) {
      throw new Error(
        'BigPay rate limited the save (429), so the card was never vaulted. BigPay limits saves ' +
          'both per customer and store wide, and the limit clears with time — this is the test ' +
          'store throttling vaulting, not a product defect.',
      );
    }

    throw error;
  }
}

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

test('Initialization data is requested when the payment method requires it', async ({
  page,
  customer,
}) => {
  await page.route(`**${VAULT_INITIALIZATION_PATH}*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        paymentProviderInitializationData: { token: null, clientConfiguration: null },
      }),
    }),
  );

  await customer.login();

  const initializationRequest = page.waitForRequest((request) =>
    request.url().includes(VAULT_INITIALIZATION_PATH),
  );

  await page.goto(ADD_PAYMENT_METHOD_URL_REQUIRING_INIT);

  const { searchParams } = new URL((await initializationRequest).url());

  expect(searchParams.get('paymentMethodId')).toBe(DEFAULT_CARD_PAYMENT_METHOD_ID);

  expect(searchParams.get('locale')).toBe(testEnv.TESTS_LOCALE);
});

test('Initialization data is not requested when the payment method does not require it', async ({
  page,
  customer,
}) => {
  const initializationRequests: string[] = [];

  page.on('request', (request) => {
    if (request.url().includes(VAULT_INITIALIZATION_PATH)) {
      initializationRequests.push(request.url());
    }
  });

  await customer.login();
  await page.goto(ADD_PAYMENT_METHOD_URL);

  // The rendered form proves the microapp booted, so an initialization request would already
  // have fired by now if the gate were wrong.
  await expect(page.locator('#cardNumber iframe')).toBeVisible();

  expect(initializationRequests).toHaveLength(0);
});

test('A failed initialization request surfaces an error and leaves the form gated', async ({
  page,
  customer,
}) => {
  await page.route(`**${VAULT_INITIALIZATION_PATH}*`, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'failed to create vault initialization' }),
    }),
  );

  const t = await getTranslations('Account.PaymentMethods.Add.Errors');

  await customer.login();
  await page.goto(ADD_PAYMENT_METHOD_URL_REQUIRING_INIT);

  // Against the dev server React Strict Mode double-invokes the effect
  await expect(page.getByText(t('somethingWentWrong')).first()).toBeVisible();

  // `renderAccountPayments` is gated on initialization completing, so no form should mount.
  await expect(page.locator('#cardNumber iframe')).toHaveCount(0);
});

test('The vault initialization route returns the provider client configuration', async ({
  page,
  customer,
}) => {
  await customer.login();

  const response = await page.request.get(
    `${VAULT_INITIALIZATION_PATH}?paymentMethodId=${INITIALIZATION_REQUIRED_PAYMENT_METHOD_ID}`,
  );

  expect(response.status()).toBe(200);

  const body: unknown = await response.json();

  // Asserts the GraphQL inline fragment selects the provider's fields and that `clientConfigType`
  // survives the `__typename` alias, which is what the microapp discriminates on.
  expect(body).toMatchObject({
    paymentProviderInitializationData: {
      clientConfiguration: {
        clientConfigType: 'SquareV2ClientConfiguration',
        applicationId: expect.any(String),
        locationId: expect.any(String),
        environment: expect.any(String),
      },
    },
  });
});

test(
  'Vaulting a default credit card redirects to the (not yet built) payment methods list',
  { tag: [TAGS.writesData] },
  async ({ page, customer, paymentInstrument }) => {
    const vaultingCustomer = await customer.createNewCustomer();

    await customer.loginAs(vaultingCustomer);
    await paymentInstrument.trackCustomer(vaultingCustomer.id);
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

    await saveAndExpectPaymentMethodsRedirect(page);

    const t = await getTranslations();

    await expect(page.getByRole('heading', { name: t('NotFound.title') })).toBeVisible();

    // TODO: Once the payment methods list page ships with its delete action, assert the new card
    // is shown there instead of querying the API — the list rendering it is the user-visible proof.
    await expect.poll(async () => (await paymentInstrument.listVaultedDuringTest()).length).toBe(1);
  },
);

test(
  'Vaulting a Square credit card redirects to the (not yet built) payment methods list',
  { tag: [TAGS.writesData] },
  async ({ page, customer, paymentInstrument }) => {
    const vaultingCustomer = await customer.createNewCustomer();

    await customer.loginAs(vaultingCustomer);
    await paymentInstrument.trackCustomer(vaultingCustomer.id);

    const clientConfiguration = await getVaultClientConfiguration(
      page,
      INITIALIZATION_REQUIRED_PAYMENT_METHOD_ID,
    );

    // Skip rather than fail on a store that cannot vault a Square card
    // (Square v2 is not set up or vaulting is not enabled)
    test.skip(
      clientConfiguration === undefined,
      'Square is not set up for vaulting on this store; skipping.',
    );

    // Skip rather than fail on a store wired to a live Square account,
    // where test card would be declined.
    const environment = clientConfiguration?.environment;

    test.skip(
      environment !== 'SANDBOX',
      `Square is connected in '${String(environment)}' mode on this store, which rejects test cards; skipping.`,
    );

    await page.goto(SQUARE_ADD_PAYMENT_METHOD_URL);

    // Unlike the hosted-fields providers, Square renders every card field inside a single nested
    // iframe mounted on `#bc-payment-fields`, so there is one frame to reach into rather than four.
    const squareFields = page.frameLocator('#bc-payment-fields iframe');

    await expect(squareFields.locator('#cardNumber')).toBeVisible();

    await squareFields.locator('#cardNumber').fill(SQUARE_TEST_CARD.number);
    await squareFields.locator('#expirationDate').fill(SQUARE_TEST_CARD.expiry);
    await squareFields.locator('#cvv').fill(SQUARE_TEST_CARD.cvv);
    await squareFields.locator('#postalCode').fill(SQUARE_TEST_CARD.postalCode);

    await page.locator('input[name="cardholderName"]').fill(faker.person.fullName());

    await page.locator('input[name="firstName"]').fill(faker.person.firstName());
    await page.locator('input[name="lastName"]').fill(faker.person.lastName());
    await page.locator('input[name="address1"]').fill(faker.location.streetAddress());
    await page.locator('input[name="city"]').fill(faker.location.city());
    await page.locator('select[name="countryCode"]').selectOption({ label: 'United States' });
    await page
      .locator('select[name="stateOrProvinceCode"]')
      .selectOption({ label: SQUARE_TEST_CARD.state });
    await page.locator('input[name="postalCode"]').fill(SQUARE_TEST_CARD.postalCode);

    await saveAndExpectPaymentMethodsRedirect(page);

    const t = await getTranslations();

    await expect(page.getByRole('heading', { name: t('NotFound.title') })).toBeVisible();

    // TODO: Once the payment methods list page ships with its delete action, assert the new card
    // is shown there instead of querying the API — the list rendering it is the user-visible proof.
    await expect.poll(async () => (await paymentInstrument.listVaultedDuringTest()).length).toBe(1);
  },
);

test(
  'Vaulting a Stripe credit card redirects to the (not yet built) payment methods list',
  { tag: [TAGS.writesData] },
  async ({ page, customer, paymentInstrument }) => {
    const vaultingCustomer = await customer.createNewCustomer();

    await customer.loginAs(vaultingCustomer);
    await paymentInstrument.trackCustomer(vaultingCustomer.id);

    const clientConfiguration = await getVaultClientConfiguration(page, STRIPE_PAYMENT_METHOD_ID);

    // Skip rather than fail on a store that cannot vault a Stripe card at all.
    test.skip(
      clientConfiguration === undefined,
      'Stripe is not set up for vaulting on this store; skipping.',
    );

    // Skip rather than fail on a store wired to a live Stripe account,
    // where this card would be declined.
    const publishableKey = clientConfiguration?.publishableKey;

    test.skip(
      typeof publishableKey !== 'string' || !publishableKey.startsWith('pk_test_'),
      'Stripe is connected in live mode on this store, which rejects test cards; skipping.',
    );

    await page.goto(STRIPE_ADD_PAYMENT_METHOD_URL);

    const stripeFields = page.frameLocator('#stripeocs-iframe-container iframe');

    await expect(stripeFields.locator('input[name="number"]')).toBeVisible();

    await stripeFields.locator('input[name="number"]').fill(STRIPE_TEST_CARD.number);
    await stripeFields.locator('input[name="expiry"]').fill(STRIPE_TEST_CARD.expiry);
    await stripeFields.locator('input[name="cvc"]').fill(STRIPE_TEST_CARD.cvc);

    await page.locator('input[name="firstName"]').fill(faker.person.firstName());
    await page.locator('input[name="lastName"]').fill(faker.person.lastName());
    await page.locator('input[name="address1"]').fill(faker.location.streetAddress());
    await page.locator('input[name="city"]').fill(faker.location.city());
    await page.locator('select[name="countryCode"]').selectOption({ label: 'United States' });
    await page.locator('select[name="stateOrProvinceCode"]').selectOption({ label: 'California' });
    await page.locator('input[name="postalCode"]').fill('94103');

    await saveAndExpectPaymentMethodsRedirect(page);

    const t = await getTranslations();

    await expect(page.getByRole('heading', { name: t('NotFound.title') })).toBeVisible();

    // TODO: Once the payment methods list page ships with its delete action, assert the new card
    // is shown there instead of querying the API — the list rendering it is the user-visible proof.
    await expect.poll(async () => (await paymentInstrument.listVaultedDuringTest()).length).toBe(1);
  },
);
