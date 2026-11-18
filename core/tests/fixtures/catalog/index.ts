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
  attributeIds: number[] = [];
  templateIds: number[] = [];

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

  // Gives a product catalog attributes. Each pair becomes a new dropdown attribute
  // whose only value is `value`; the attributes are bundled into a new product
  // template that is assigned to the product with those values selected.
  async assignAttributesToProduct(
    productId: number,
    attributes: Array<{ displayName: string; value: string }>,
  ): Promise<void> {
    this.skipIfReadonly();

    const suffix = faker.string.alpha(5);

    const created = await Promise.all(
      attributes.map(async ({ displayName, value }, index) => {
        const attribute = await this.api.catalog.createAttribute({
          name: `test_attribute_${suffix}_${index}`,
          displayName,
          values: [value],
        });

        this.attributeIds.push(attribute.id);

        const attributeValue = attribute.values.find(({ label }) => label === value);

        if (!attributeValue) {
          throw new Error(`Catalog attribute ${attribute.id} is missing value "${value}"`);
        }

        return { id: attribute.id, valueId: attributeValue.id };
      }),
    );

    const template = await this.api.catalog.createProductTemplate({
      name: `Test Template ${suffix}`,
      attributes: created.map(({ id, valueId }) => ({ id, valueIds: [valueId] })),
    });

    this.templateIds.push(template.id);

    await this.api.catalog.assignProductTemplate({
      templateId: template.id,
      productId,
      attributeValues: created,
    });
  }

  async cleanup() {
    await this.api.catalog.deleteProductTemplateAssignments(this.templateIds);
    await this.api.catalog.deleteProductTemplates(this.templateIds);
    await this.api.catalog.deleteAttributes(this.attributeIds);
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
