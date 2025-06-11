import { CatalogApi, catalogHttpClient } from '~/tests/fixtures/utils/api/catalog';
import { CurrenciesApi, currenciesHttpClient } from '~/tests/fixtures/utils/api/currencies';
import { CustomersApi, customersHttpClient } from '~/tests/fixtures/utils/api/customers';
import { OrdersApi, ordersHttpClient } from '~/tests/fixtures/utils/api/orders';

export interface ApiClient {
  catalog: CatalogApi;
  customers: CustomersApi;
  currencies: CurrenciesApi;
  orders: OrdersApi;
}

export const httpApiClient: ApiClient = {
  catalog: catalogHttpClient,
  customers: customersHttpClient,
  currencies: currenciesHttpClient,
  orders: ordersHttpClient,
};
