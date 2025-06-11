/* eslint-disable valid-jsdoc */
import { faker } from '@faker-js/faker';

import { generateCustomerLoginApiJwt } from '~/auth/customer-login-api';
import { testEnv } from '~/tests/environment';
import { expect, Page } from '~/tests/fixtures';
import { Fixture } from '~/tests/fixtures/fixture';
import {
  Address,
  CreateCustomerData,
  CreateWishlistData,
  Customer,
  Wishlist,
} from '~/tests/fixtures/utils/api/customers';
import { getTranslations } from '~/tests/lib/i18n';

import { customerSessionStore } from './session';

export class CustomerFixture extends Fixture {
  customers: Customer[] = [];
  addresses: Address[] = [];
  wishlists: Wishlist[] = [];

  constructor(
    readonly reuseCustomerSession: boolean,
    ...args: ConstructorParameters<typeof Fixture>
  ) {
    super(...args);
  }

  /**
   * Checks environment variables for a test customer. If the test customer is not found, it creates a new one. \
   * This method should always be preferred over creating a new customer directly, unless the test you are writing specifically requires a new customer.
   */
  async getOrCreateTestCustomer(): Promise<Customer> {
    const testCustomer = await this.getTestCustomer();

    if (testCustomer) {
      return testCustomer;
    }

    return this.createNewCustomer();
  }

  async createNewCustomer(): Promise<Customer> {
    this.skipIfReadonly();

    // Prefix is added to ensure that the password requirements are met
    const password = faker.internet.password({
      pattern: /[a-zA-Z0-9]/,
      prefix: '1At!',
      length: 10,
    });

    const customer = await this.api.customers.create(this.fakeCreateCustomerData(password, true));

    this.customers.push(customer);

    return customer;
  }

  async getTestCustomer(): Promise<Customer | undefined> {
    if (
      !testEnv.TEST_CUSTOMER_ID ||
      !testEnv.TEST_CUSTOMER_EMAIL ||
      !testEnv.TEST_CUSTOMER_PASSWORD
    ) {
      return undefined;
    }

    const customer = await this.api.customers.getById(testEnv.TEST_CUSTOMER_ID, true);

    customer.password = testEnv.TEST_CUSTOMER_PASSWORD;

    return customer;
  }

  /** Gets customer information from the API via ID. Will not include a password, as this cannot be obtained via API. */
  getById(customerId: number, includeAddresses?: boolean): Promise<Customer> {
    return this.api.customers.getById(customerId, includeAddresses);
  }

  getByEmail(email: string, includeAddresses?: boolean): Promise<Customer> {
    return this.api.customers.getByEmail(email, includeAddresses);
  }

  async createAddress(customerId: number): Promise<Address> {
    this.skipIfReadonly();

    const address = await this.api.customers.createAddress(
      this.fakeCreateAddressData({ customerId }),
    );

    this.addresses.push(address);

    return address;
  }

  async createWishlist({
    customerId,
    name = `Test wishlist ${faker.string.alpha(10)}`,
    isPublic = false,
    items = [],
  }: Partial<CreateWishlistData> & { customerId: number }): Promise<Wishlist> {
    this.skipIfReadonly();

    const wishlist = await this.api.customers.createWishlist({
      name,
      isPublic,
      customerId,
      items,
    });

    this.wishlists.push(wishlist);

    return wishlist;
  }

  async generateLoginJwt(customerId: number, redirectTo = '/account/orders'): Promise<string> {
    try {
      return await generateCustomerLoginApiJwt(
        customerId,
        testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1,
        redirectTo,
      );
    } catch {
      this.test.skip(true, 'Failed to generate JWT for customer login test');

      // Will never be reached due to the test.skip
      return '';
    }
  }

  /**
   * Logs in with the designated test customer account, or makes a new customer account to login with if no test account is set.
   * If possible, will reuse an existing login session to avoid unnecessary logins.
   */
  async login(redirectTo?: string): Promise<Customer> {
    const customer = await this.getOrCreateTestCustomer();

    await this.loginAs(customer, redirectTo);

    return customer;
  }

  async loginAs(customer: Customer, redirectTo?: string): Promise<void> {
    if (!customer.password) {
      throw new Error('Unable to perform login due to customer password not being set.');
    }

    const t = await getTranslations('Auth.Login');
    const searchParams = redirectTo ? `?${new URLSearchParams({ redirectTo }).toString()}` : '';
    const url = `/login${searchParams}`;

    if (!redirectTo && this.reuseCustomerSession) {
      const usedExistingSession = await customerSessionStore.useExistingSession(this, customer.id);

      if (usedExistingSession) {
        return;
      }
    }

    await this.page.goto(url);
    await this.page.getByLabel(t('email')).fill(customer.email);
    await this.page.getByLabel(t('password')).fill(customer.password);
    await this.page.getByRole('button', { name: t('cta') }).click();
    await this.page.waitForLoadState('networkidle');

    await expect(this.page.getByText(t('invalidCredentials'))).not.toBeVisible();
    await expect(this.page).not.toHaveURL(url);

    // If the assertions are passed, we can assume login was successful.
    await customerSessionStore.updateCustomerSession(this, customer.id);
  }

  async logout(): Promise<void> {
    const t = await getTranslations();

    await this.page.getByLabel(t('Components.Header.Icons.account')).click();
    await this.page.waitForURL('/account/**');
    await this.page.getByRole('link', { name: t('Account.Layout.logout') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async delete(...customerIds: number[]): Promise<void> {
    this.skipIfReadonly();

    await this.api.customers.delete(customerIds);
  }

  async deleteAllAddresses(customerId: number): Promise<void> {
    this.skipIfReadonly();

    const addresses = await this.api.customers.getAddresses(customerId);

    await this.api.customers.deleteAddresses(addresses.map(({ id }) => id));
  }

  async deleteAllWishlists(customerId: number): Promise<void> {
    this.skipIfReadonly();

    const wishlists = await this.api.customers.getWishlists(customerId);

    await this.api.customers.deleteWishlists(wishlists.map(({ id }) => id));
  }

  /** Clones the fixture with a new page object. Useful if the fixture is needed in a new browser window. */
  withNewPage(page: Page): CustomerFixture {
    return new CustomerFixture(this.reuseCustomerSession, page, this.test);
  }

  async cleanup() {
    // Cleanup will not remove the test customer set in the environment variables
    await this.api.customers.delete(
      this.customers.map(({ id }) => id).filter((id) => id !== testEnv.TEST_CUSTOMER_ID),
    );

    await this.api.customers.deleteAddresses(this.addresses.map(({ id }) => id));
    await this.api.customers.deleteWishlists(this.wishlists.map(({ id }) => id));
  }

  private fakeCreateAddressData({
    firstName,
    lastName,
    customerId,
  }: {
    firstName?: string;
    lastName?: string;
    customerId?: number;
  }) {
    const first = firstName ?? faker.person.firstName();
    const last = lastName ?? faker.person.lastName();
    const address1 = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state();
    const postalCode = faker.location.zipCode('#####');

    return {
      ...(customerId ? { customerId } : {}),
      firstName: first,
      lastName: last,
      address1,
      city,
      stateOrProvince: state,
      countryCode: 'US',
      postalCode,
    };
  }

  private fakeCreateCustomerData(
    password: string,
    createFakeAddress?: boolean,
  ): CreateCustomerData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });

    return {
      firstName,
      lastName,
      email,
      password,
      ...(createFakeAddress
        ? { addresses: [this.fakeCreateAddressData({ firstName, lastName })] }
        : {}),
      originChannelId: Number(testEnv.BIGCOMMERCE_CHANNEL_ID),
    };
  }
}
