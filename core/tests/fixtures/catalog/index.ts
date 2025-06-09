import { testEnv } from '~/tests/environment';
import { Fixture } from '~/tests/fixtures/fixture';
import { Brand, Category, Product } from '~/tests/fixtures/utils/api/catalog';

export class CatalogFixture extends Fixture {
  getDefaultProduct(): Promise<Product> {
    if (!testEnv.DEFAULT_PRODUCT_ID) {
      throw new Error(
        `DEFAULT_PRODUCT_ID is not set in the test environment variables and is required for the current test [${this.test.title}]`,
      );
    }

    return this.api.catalog.getProductById(testEnv.DEFAULT_PRODUCT_ID);
  }

  getCategories(filters?: { nameLike?: string; ids?: number[] }): Promise<Category[]> {
    return this.api.catalog.getCategories(filters);
  }

  getBrands(filters?: { nameLike?: string; ids?: number[] }): Promise<Brand[]> {
    return this.api.catalog.getBrands(filters);
  }

  async cleanup() {
    // no cleanup needed
  }
}
