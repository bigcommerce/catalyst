import { expect } from '@playwright/test';
import { validate as isUuid } from 'uuid';

expect.extend({
  toBeUuid(received: string) {
    const pass = isUuid(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a uuid`,
        pass: true,
      };
    }

    return {
      message: () => `expected ${received} to be a uuid`,
      pass: false,
    };
  },
});
