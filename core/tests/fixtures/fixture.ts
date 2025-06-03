import { type Page, type TestInfo } from '@playwright/test';

import { TestApiClient } from '~/tests/fixtures/utils/api';

export abstract class Fixture {
  protected readonly api: TestApiClient;

  constructor(
    readonly page: Page,
    readonly test: TestInfo,
  ) {
    this.api = new TestApiClient(test);
  }

  abstract cleanup(): Promise<void>;
}
