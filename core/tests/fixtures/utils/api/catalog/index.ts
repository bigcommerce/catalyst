export interface Variant {
  readonly id: number;
  readonly productId: number;
  readonly sku: string;
  readonly price?: number;
  readonly salePrice?: number;
  readonly retailPrice?: number;
  readonly optionValues: Array<{
    readonly id: number;
    readonly label: string;
    readonly optionId: number;
    readonly optionDisplayName: string;
  }>;
  readonly inventoryLevel?: number;
  readonly inventoryWarningLevel?: number;
}
export interface Product {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly sku: string;
  readonly price: number;
  readonly retailPrice: number;
  readonly salePrice: number;
  readonly path: string;
  readonly variants: Variant[];
  readonly categories: number[];
  readonly inventoryLevel?: number;
  readonly inventoryWarningLevel?: number;
  readonly inventoryTracking?: 'none' | 'product' | 'variant';
  readonly customUrl: {
    url: string;
  };
}

export interface CreateVariantData {
  sku: string;
  optionValues: Array<{
    label: string;
    optionDisplayName: string;
  }>;
  price?: number;
  salePrice?: number;
  retailPrice?: number;
  inventoryLevel?: number;
  inventoryWarningLevel?: number;
}

export interface CreateProductData {
  name: string;
  weight: number;
  price: number;
  salePrice?: number;
  retailPrice?: number;
  sku?: string;
  type?: 'physical' | 'digital';
  description?: string;
  isVisible?: boolean;
  categories?: number[];
  variants?: CreateVariantData[];
  inventoryLevel?: number;
  inventoryWarningLevel?: number;
  inventoryTracking?: 'none' | 'product' | 'variant';
  customUrl?: {
    url: string;
    isCustomized?: boolean;
    createRedirect?: boolean;
  };
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

export interface CatalogAttribute {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly values: Array<{
    readonly id: number;
    readonly label: string;
  }>;
}

export interface CreateCatalogAttributeData {
  name: string;
  displayName: string;
  values: string[];
}

export interface ProductTemplate {
  readonly id: number;
  readonly name: string;
}

export interface CreateProductTemplateData {
  name: string;
  attributes: Array<{
    id: number;
    valueIds: number[];
  }>;
}

export interface AssignProductTemplateData {
  templateId: number;
  productId: number;
  attributeValues: Array<{
    id: number;
    valueId: number;
  }>;
}

export interface CatalogApi {
  getProductById: (id: number) => Promise<Product>;
  getCategories: (filters?: { nameLike?: string; ids?: number[] }) => Promise<Category[]>;
  getBrands: (filters?: { nameLike?: string; ids?: number[] }) => Promise<Brand[]>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  deleteProducts: (ids: number[]) => Promise<void>;
  createAttribute: (data: CreateCatalogAttributeData) => Promise<CatalogAttribute>;
  deleteAttributes: (ids: number[]) => Promise<void>;
  createProductTemplate: (data: CreateProductTemplateData) => Promise<ProductTemplate>;
  deleteProductTemplates: (ids: number[]) => Promise<void>;
  assignProductTemplate: (data: AssignProductTemplateData) => Promise<void>;
  deleteProductTemplateAssignments: (templateIds: number[]) => Promise<void>;
}

export { catalogHttpClient } from './http';
