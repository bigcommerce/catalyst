import { testEnv } from '~/tests/environment';
import { Fixture } from '~/tests/fixtures/fixture';
import { apiResponseSchema } from '~/tests/fixtures/utils/api/schema';

import { Product } from './product';

export class CatalogFixture extends Fixture {
  async getDefaultProduct(): Promise<Product> {
    if (!testEnv.DEFAULT_PRODUCT_ID) {
      throw new Error(
        `DEFAULT_PRODUCT_ID is not set in the test environment variables and is required for the current test [${this.test.title}]`,
      );
    }

    const resp = await this.api
      .get(`/v3/catalog/products/${testEnv.DEFAULT_PRODUCT_ID}`)
      .parse(apiResponseSchema(Product.schema));

    return Product.fromApiResponse(resp.data);
  }

  async getProductById(id: number): Promise<Product> {
    const resp = await this.api
      .get(`/v3/catalog/products/${id}`)
      .parse(apiResponseSchema(Product.schema));

    return Product.fromApiResponse(resp.data);
  }

  async cleanup() {
    // no cleanup needed
  }
}
