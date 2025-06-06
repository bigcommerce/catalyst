import { CatalogApi, catalogHttpClient } from '~/tests/fixtures/utils/api/catalog';
import { CustomersApi, customersHttpClient } from '~/tests/fixtures/utils/api/customers';
import { OrdersApi, ordersHttpClient } from '~/tests/fixtures/utils/api/orders';

export interface ApiClient {
  catalog: CatalogApi;
  customers: CustomersApi;
  orders: OrdersApi;
}

export const httpApiClient: ApiClient = {
  catalog: catalogHttpClient,
  customers: customersHttpClient,
  orders: ordersHttpClient,
};
