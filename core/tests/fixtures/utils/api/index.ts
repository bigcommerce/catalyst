import { BlogApi, blogHttpClient } from '~/tests/fixtures/utils/api/blog';
import { CatalogApi, catalogHttpClient } from '~/tests/fixtures/utils/api/catalog';
import { CurrenciesApi, currenciesHttpClient } from '~/tests/fixtures/utils/api/currencies';
import { CustomersApi, customersHttpClient } from '~/tests/fixtures/utils/api/customers';
import { OrdersApi, ordersHttpClient } from '~/tests/fixtures/utils/api/orders';
import { PromotionsApi, promotionsHttpClient } from '~/tests/fixtures/utils/api/promotions';
import { WebPagesApi, webPagesHttpClient } from '~/tests/fixtures/utils/api/webpages';

export interface ApiClient {
  blog: BlogApi;
  catalog: CatalogApi;
  customers: CustomersApi;
  currencies: CurrenciesApi;
  orders: OrdersApi;
  promotions: PromotionsApi;
  webPages: WebPagesApi;
}

export const httpApiClient: ApiClient = {
  blog: blogHttpClient,
  catalog: catalogHttpClient,
  customers: customersHttpClient,
  currencies: currenciesHttpClient,
  orders: ordersHttpClient,
  promotions: promotionsHttpClient,
  webPages: webPagesHttpClient,
};
