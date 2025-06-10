export interface CurrencyAssignments {
  readonly enabledCurrencies: string[];
  readonly defaultCurrency: string;
}

export interface Currency {
  readonly id: number;
  readonly isDefault: boolean;
  readonly isEnabled: boolean;
  readonly decimalPlaces: number;
  readonly exchangeRate: number;
  readonly currencyCode: string;
}

export interface CurrenciesApi {
  getCurrencyAssignments: () => Promise<CurrencyAssignments>;
  getCurrencies: () => Promise<Currency[]>;
}

export { currenciesHttpClient } from './http';
