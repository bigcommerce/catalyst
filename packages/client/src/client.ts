import {
  BigCommerceResponse,
  customWrappedFetch,
  FetcherConfig,
  FetcherInput,
  FetcherRequestInit,
} from './fetcher';
// Management API (no graphql)
import { getCheckoutUrl } from './management/getCheckoutUrl';
// Mutations
import { addCartLineItem } from './mutations/addCartLineItem';
import { createCart } from './mutations/createCart';
import { deleteCartLineItem } from './mutations/deleteCartLineItem';
import { login } from './mutations/login';
import { updateCartLineItem } from './mutations/updateCartLineItem';
// Queries
import { getBestSellingProducts } from './queries/getBestSellingProducts';
import { getBrand } from './queries/getBrand';
import { getBrands } from './queries/getBrands';
import { getCart } from './queries/getCart';
import { getCategory } from './queries/getCategory';
import { getCategoryTree } from './queries/getCategoryTree';
import { getFeaturedProducts } from './queries/getFeaturedProducts';
import { getProduct } from './queries/getProduct';
import { getProductReviews } from './queries/getProductReviews';
import { getProducts } from './queries/getProducts';
import { getProductSearchResults } from './queries/getProductSearchResults';
import { getQuickSearchResults } from './queries/getQuickSearchResults';
import { getRelatedProducts } from './queries/getRelatedProducts';
import { getRoute } from './queries/getRoute';
import { getStoreSettings } from './queries/getStoreSettings';
import { getWebPage } from './queries/getWebPage';
import { getWebPages } from './queries/getWebPages';

type OmitFirstInTuple<T extends unknown[]> = T extends [unknown, ...infer U] ? U : [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PublicParams<T extends (...args: any[]) => any> = OmitFirstInTuple<Parameters<T>>;

class Client<CustomRequestInit extends FetcherRequestInit = FetcherRequestInit> {
  private config: FetcherConfig;
  private fetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>;

  constructor(config: FetcherConfig) {
    this.config = config;
    this.fetch = customWrappedFetch(config);
  }

  getBestSellingProducts(...args: PublicParams<typeof getBestSellingProducts<CustomRequestInit>>) {
    return getBestSellingProducts(this.fetch, ...args);
  }

  getBrand(...args: PublicParams<typeof getBrand<CustomRequestInit>>) {
    return getBrand(this.fetch, ...args);
  }

  getBrands(...args: PublicParams<typeof getBrands<CustomRequestInit>>) {
    return getBrands(this.fetch, ...args);
  }

  getCategory(...args: PublicParams<typeof getCategory<CustomRequestInit>>) {
    return getCategory(this.fetch, ...args);
  }

  getCategoryTree(...args: PublicParams<typeof getCategoryTree<CustomRequestInit>>) {
    return getCategoryTree(this.fetch, ...args);
  }

  getFeaturedProducts(...args: PublicParams<typeof getFeaturedProducts<CustomRequestInit>>) {
    return getFeaturedProducts(this.fetch, ...args);
  }

  getProduct(...args: PublicParams<typeof getProduct<CustomRequestInit>>) {
    return getProduct(this.fetch, ...args);
  }

  getProducts(...args: PublicParams<typeof getProducts<CustomRequestInit>>) {
    return getProducts(this.fetch, ...args);
  }

  getProductReviews(...args: PublicParams<typeof getProductReviews<CustomRequestInit>>) {
    return getProductReviews(this.fetch, ...args);
  }

  getProductSearchResults(
    ...args: PublicParams<typeof getProductSearchResults<CustomRequestInit>>
  ) {
    return getProductSearchResults(this.fetch, ...args);
  }

  getQuickSearchResults(...args: PublicParams<typeof getQuickSearchResults<CustomRequestInit>>) {
    return getQuickSearchResults(this.fetch, ...args);
  }

  getRelatedProducts(...args: PublicParams<typeof getRelatedProducts<CustomRequestInit>>) {
    return getRelatedProducts(this.fetch, ...args);
  }

  getStoreSettings(...args: PublicParams<typeof getStoreSettings<CustomRequestInit>>) {
    return getStoreSettings(this.fetch, ...args);
  }

  getWebPage(...args: PublicParams<typeof getWebPage<CustomRequestInit>>) {
    return getWebPage(this.fetch, ...args);
  }

  getWebPages(...args: PublicParams<typeof getWebPages<CustomRequestInit>>) {
    return getWebPages(this.fetch, ...args);
  }

  getCart(...args: PublicParams<typeof getCart<CustomRequestInit>>) {
    return getCart(this.fetch, ...args);
  }

  getRoute(...args: PublicParams<typeof getRoute<CustomRequestInit>>) {
    return getRoute(this.fetch, ...args);
  }

  createCart(...args: PublicParams<typeof createCart<CustomRequestInit>>) {
    return createCart(this.fetch, ...args);
  }

  addCartLineItem(...args: PublicParams<typeof addCartLineItem<CustomRequestInit>>) {
    return addCartLineItem(this.fetch, ...args);
  }

  deleteCartLineItem(...args: PublicParams<typeof deleteCartLineItem<CustomRequestInit>>) {
    return deleteCartLineItem(this.fetch, ...args);
  }

  login(...args: PublicParams<typeof login<CustomRequestInit>>) {
    return login(this.fetch, ...args);
  }

  updateCartLineItem(...args: PublicParams<typeof updateCartLineItem<CustomRequestInit>>) {
    return updateCartLineItem(this.fetch, ...args);
  }

  getCheckoutUrl(id: string) {
    return getCheckoutUrl(id, this.config.storeHash, this.config.xAuthToken);
  }
}

export function createClient<CustomRequestInit extends FetcherRequestInit = FetcherRequestInit>(
  config: FetcherConfig,
): Client<CustomRequestInit> {
  const client = new Client<CustomRequestInit>(config);

  return client;
}
