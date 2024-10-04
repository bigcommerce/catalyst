import { type Page } from '@playwright/test';

import { getProduct } from './get';
import { Product } from './product';

export class ProductFactory {
  constructor(private readonly page: Page) {}

  async get(productId: number) {
    const productData = await getProduct(productId);

    return new Product(
      this.page,
      productData.name,
      productData.type,
      productData.price,
      productData.id,
      productData.custom_url.url,
    );
  }
}
