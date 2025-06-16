import { faker } from '@faker-js/faker';

import { testEnv } from '~/tests/environment';
import { Fixture } from '~/tests/fixtures/fixture';
import {
  Brand,
  Category,
  CreateProductData,
  CreateVariantData,
  Product,
} from '~/tests/fixtures/utils/api/catalog';

export class CatalogFixture extends Fixture {
  products: Product[] = [];

  async getDefaultOrCreateSimpleProduct(): Promise<Product> {
    if (!testEnv.DEFAULT_PRODUCT_ID) {
      return this.createSimpleProduct();
    }

    const testProduct = await this.api.catalog.getProductById(testEnv.DEFAULT_PRODUCT_ID);

    if (testProduct.inventoryLevel === 0 && testProduct.inventoryTracking !== 'none') {
      throw new Error(
        'Product for DEFAULT_PRODUCT_ID is out of stock and cannot be used in tests.',
      );
    }

    return testProduct;
  }

  async getDefaultOrCreateComplexProduct(): Promise<Product> {
    if (!testEnv.DEFAULT_COMPLEX_PRODUCT_ID) {
      return this.createComplexProduct();
    }

    const testProduct = await this.api.catalog.getProductById(testEnv.DEFAULT_COMPLEX_PRODUCT_ID);

    if (testProduct.inventoryLevel === 0 && testProduct.inventoryTracking !== 'none') {
      throw new Error(
        'Product for DEFAULT_COMPLEX_PRODUCT_ID is out of stock and cannot be used in tests.',
      );
    }

    return testProduct;
  }

  getCategories(filters?: { nameLike?: string; ids?: number[] }): Promise<Category[]> {
    return this.api.catalog.getCategories(filters);
  }

  getBrands(filters?: { nameLike?: string; ids?: number[] }): Promise<Brand[]> {
    return this.api.catalog.getBrands(filters);
  }

  async createSimpleProduct(
    overrides?: Partial<Omit<CreateProductData, 'variants'>>,
  ): Promise<Product> {
    this.skipIfReadonly();

    const product = await this.api.catalog.createProduct(this.fakeCreateProductData(overrides));

    this.products.push(product);

    return product;
  }

  async createComplexProduct(overrides?: Partial<CreateProductData>): Promise<Product> {
    this.skipIfReadonly();

    const product = await this.api.catalog.createProduct({
      ...this.fakeCreateProductData(overrides),
      variants: [
        this.fakeCreateVariantData('Small'),
        this.fakeCreateVariantData('Medium'),
        this.fakeCreateVariantData('Large'),
      ],
    });

    this.products.push(product);

    return product;
  }

  async cleanup() {
    await this.api.catalog.deleteProducts(this.products.map(({ id }) => id));
  }

  private fakeCreateProductData(
    data?: Partial<Omit<CreateProductData, 'variants'>>,
  ): CreateProductData {
    const suffix = faker.string.alpha(5);

    return {
      name: `Test Product ${suffix}`,
      weight: faker.number.int({ min: 1, max: 100 }),
      price: faker.number.int({ min: 10, max: 1000 }),
      salePrice: faker.number.int({ min: 5, max: 900 }),
      retailPrice: faker.number.int({ min: 15, max: 1100 }),
      sku: `TEST-PRODUCT-${suffix.toUpperCase()}`,
      type: 'physical',
      description: faker.lorem.paragraph({ min: 3, max: 50 }),
      isVisible: true,
      inventoryLevel: faker.number.int({ min: 10, max: 100 }),
      inventoryWarningLevel: faker.number.int({ min: 1, max: 50 }),
      inventoryTracking: 'none',
      ...data,
    };
  }

  private fakeCreateVariantData(label?: string): CreateVariantData {
    const suffix = faker.string.alpha(5);

    return {
      sku: `TEST-VARIANT-${suffix.toUpperCase()}`,
      optionValues: [
        {
          label: label ?? suffix,
          optionDisplayName: 'Size',
        },
      ],
      price: faker.number.int({ min: 10, max: 1000 }),
      salePrice: faker.number.int({ min: 5, max: 900 }),
      retailPrice: faker.number.int({ min: 15, max: 1100 }),
    };
  }
}
