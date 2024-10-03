import { type Page } from '@playwright/test';

export class Product {
  constructor(
    private readonly page: Page,
    readonly name: string,
    readonly type: string,
    readonly price: number | null,
    readonly id: number,
    readonly url: string,
  ) {}
}
