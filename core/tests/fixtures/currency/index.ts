import { Fixture } from '~/tests/fixtures/fixture';
import { getTranslations } from '~/tests/lib/i18n';

export class CurrencyFixture extends Fixture {
  async getDefaultCurrency(): Promise<string> {
    const currencyAssignments = await this.api.currencies.getCurrencyAssignments();

    return currencyAssignments.defaultCurrency;
  }

  async getEnabledCurrencies(): Promise<string[]> {
    const currencyAssignments = await this.api.currencies.getCurrencyAssignments();

    return currencyAssignments.enabledCurrencies;
  }

  async convertWithExchangeRate(currencyCode: string, value: number): Promise<number> {
    const currencies = await this.api.currencies.getCurrencies();
    const currency = currencies.find((c) => c.currencyCode === currencyCode);

    if (!currency) {
      throw new Error(`Currency with code ${currencyCode} not found`);
    }

    return value * currency.exchangeRate;
  }

  async selectCurrency(currency: string): Promise<void> {
    const t = await getTranslations('Components.Header.SwitchCurrency');

    await this.page.getByRole('button', { name: t('label') }).click();
    await this.page.getByRole('menuitem', { name: currency }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async cleanup() {
    // no cleanup needed
  }
}
