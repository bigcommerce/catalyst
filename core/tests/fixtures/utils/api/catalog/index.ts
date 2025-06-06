export interface Product {
  readonly id: number;
  readonly name: string;
  readonly sku: string;
  readonly price: number;
  readonly retailPrice: number;
  readonly salePrice: number;
  readonly path: string;
}

export interface Category {
  readonly categoryId: number;
  readonly parentId: number;
  readonly name: string;
  readonly description: string;
  readonly path: string;
}

export interface Brand {
  readonly id: number;
  readonly name: string;
  readonly path: string;
}

export interface CatalogApi {
  getProductById: (id: number) => Promise<Product>;
  getCategories: (filters?: { nameLike?: string; ids?: number[] }) => Promise<Category[]>;
  getBrands: (filters?: { nameLike?: string; ids?: number[] }) => Promise<Brand[]>;
}

export { catalogHttpClient } from './http';
