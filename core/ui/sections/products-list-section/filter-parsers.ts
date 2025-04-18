import { parseAsArrayOf, parseAsInteger, parseAsString, ParserBuilder } from 'nuqs/server';

import { Filter } from './filters-panel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFilterParsers(filters: Filter[]): Record<string, ParserBuilder<any>> {
  return filters
    .filter((filter) => filter.type !== 'link-group')
    .reduce((acc, filter) => {
      switch (filter.type) {
        case 'range':
          return {
            ...acc,
            [filter.minParamName]: parseAsInteger,
            [filter.maxParamName]: parseAsInteger,
          };

        case 'toggle-group':
          return {
            ...acc,
            [filter.paramName]: parseAsArrayOf(parseAsString),
          };

        case 'rating':
          return {
            ...acc,
            [filter.paramName]: parseAsArrayOf(parseAsString),
          };

        default:
          return {
            ...acc,
          };
      }
    }, {});
}
