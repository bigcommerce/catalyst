import { type Page, type TestInfo } from '@playwright/test';

import { testEnv } from '~/tests/environment';
import { ApiClient, httpApiClient } from '~/tests/fixtures/utils/api';

export abstract class Fixture {
  protected readonly api: ApiClient;

  constructor(
    readonly page: Page,
    readonly test: TestInfo,
  ) {
    this.api = httpApiClient;
  }

  protected skipIfReadonly(): void {
    if (testEnv.TESTS_READ_ONLY) {
      this.test.skip(true, 'Tests are running in read-only mode.');
    }
  }

  abstract cleanup(): Promise<void>;
}
