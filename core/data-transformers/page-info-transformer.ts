import { ResultOf } from 'gql.tada';

import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { PaginationFragment } from '~/client/fragments/pagination';

export const defaultPageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

export function pageInfoTransformer(
  pageInfo: ResultOf<typeof PaginationFragment>,
): CursorPaginationInfo {
  return {
    startCursorParamName: 'before',
    startCursor: pageInfo.startCursor,
    endCursorParamName: 'after',
    endCursor: pageInfo.endCursor,
  };
}
