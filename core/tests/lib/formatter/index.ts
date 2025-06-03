import { createFormatter } from 'next-intl';

import { testEnv } from '~/tests/environment';

// Simple wrapper to allow using the NextJS formatter inside of tests
export function getFormatter() {
  return createFormatter({ locale: testEnv.TESTS_LOCALE });
}
