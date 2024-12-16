import { parseAsArrayOf, parseAsInteger, parseAsString, ParserBuilder } from 'nuqs/server';

import { Filter } from './filters-panel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFilterParsers(filters: Filter[]): Record<string, ParserBuilder<any>> {
  return filters.reduce((acc, filter) => {
    switch (filter.type) {
      case 'range':
        return {
          ...acc,
          [filter.minParamName]: parseAsInteger,
          [filter.maxParamName]: parseAsInteger,
        };

      default:
        return {
          ...acc,
          [filter.paramName]: parseAsArrayOf(parseAsString),
        };
    }
  }, {});
}
