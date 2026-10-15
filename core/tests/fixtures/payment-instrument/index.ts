import { testEnv } from '~/tests/environment';
import { Fixture } from '~/tests/fixtures/fixture';
import { StoredInstrument } from '~/tests/fixtures/utils/api/storedinstruments';

/**
 * Removes payment instruments vaulted during a test so they do not accumulate on the customer
 * under test, and exposes what the test vaulted so a test can assert the card really was stored.
 */
export class PaymentInstrumentFixture extends Fixture {
  private preexistingTokens = new Set<string>();
  private customerId = testEnv.TEST_CUSTOMER_ID;

  async trackCustomer(customerId: number): Promise<void> {
    this.customerId = customerId;

    await this.recordPreexisting();
  }

  async recordPreexisting(): Promise<void> {
    const { customerId } = this;

    if (customerId === undefined) {
      return;
    }

    const instruments = await this.api.storedInstruments.list(customerId);

    this.preexistingTokens = new Set(instruments.map(({ token }) => token));
  }

  async listVaultedDuringTest(): Promise<StoredInstrument[]> {
    const { customerId } = this;

    if (customerId === undefined) {
      return [];
    }

    const instruments = await this.api.storedInstruments.list(customerId);

    return instruments.filter(({ token }) => !this.preexistingTokens.has(token));
  }

  async cleanup(): Promise<void> {
    const { customerId } = this;

    if (customerId === undefined) {
      return;
    }

    try {
      const newInstruments = await this.listVaultedDuringTest();

      if (newInstruments.length === 0) {
        return;
      }

      await this.api.storedInstruments.delete(
        customerId,
        newInstruments.map(({ token }) => token),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Could not clean up stored payment instruments: ${String(error)}`);
    }
  }
}
