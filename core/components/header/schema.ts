import { z } from 'zod';

import type { CurrencyCode } from './fragment';

export const CurrencyCodeSchema = z
  .string()
  .length(3)
  .toUpperCase()
  .refine((val): val is CurrencyCode => /^[A-Z]{3}$/.test(val), {
    message: 'Must be a valid currency code',
  });
