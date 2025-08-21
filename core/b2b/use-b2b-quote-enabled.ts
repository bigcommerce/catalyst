'use client';

import { B2BRole } from './types';
import { useSDK } from './use-b2b-sdk';

interface Config {
  key: string;
  value: string;
}

const isConfigEnabled = (configs: Config[], key: string): boolean => {
  return configs.find((c) => c.key === key)?.value === '1';
};

export const useB2BQuoteEnabled = (): boolean => {
  const sdk = useSDK();

  const config = sdk?.utils?.quote?.getQuoteConfigs();
  const role = sdk?.utils?.user.getProfile().role;

  if (!config || role === undefined) {
    return false;
  }

  if (role === B2BRole.GUEST) {
    return isConfigEnabled(config, 'quote_for_guest');
  }

  if (role === B2BRole.B2C) {
    return isConfigEnabled(config, 'quote_for_individual_customer');
  }

  return isConfigEnabled(config, 'quote_for_b2b');
};
