import { type Page } from '@playwright/test';

import { createProduct } from './create';
import { deleteProduct } from './delete';
import { Product } from './product';

export class ProductFactory {
  autoCleanup = false;
  private products: Product[] = [];

  constructor(private readonly page: Page) {}

  async create() {
    const productData = await createProduct();

    const product = new Product(
      this.page,
      productData.name,
      productData.type,
      productData.price,
      productData.id,
      productData.url,
    );

    this.products.push(product);

    return product;
  }

  async cleanup() {
    await Promise.all(this.products.map(async (product) => await deleteProduct(product.id)));
  }
}
