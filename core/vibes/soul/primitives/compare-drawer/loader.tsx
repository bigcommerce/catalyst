import { createLoader, parseAsArrayOf, parseAsString } from 'nuqs/server';

export const compareParser = parseAsArrayOf(parseAsString).withOptions({
  shallow: false,
  scroll: false,
});

export const createCompareLoader = (paramName = 'compare') =>
  createLoader({ [paramName]: compareParser });
