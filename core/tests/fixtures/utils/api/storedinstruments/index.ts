export interface StoredInstrument {
  token: string;
  paymentMethodId: string;
}

export interface StoredInstrumentsApi {
  list: (customerId: number) => Promise<StoredInstrument[]>;
  delete: (customerId: number, tokens: string[]) => Promise<void>;
}

export { storedInstrumentsHttpClient } from './http';
