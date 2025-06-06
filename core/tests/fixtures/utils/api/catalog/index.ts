export interface Product {
  readonly id: number;
  readonly name: string;
  readonly sku: string;
  readonly price: number;
  readonly retailPrice: number;
  readonly salePrice: number;
  readonly path: string;
}

export interface CatalogApi {
  getProductById: (id: number) => Promise<Product>;
}

export { catalogHttpClient } from './http';
