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
  {
    startCursorParamName = 'before',
    endCursorParamName = 'after',
  }: { startCursorParamName?: string; endCursorParamName?: string } = {},
): CursorPaginationInfo {
  return {
    startCursorParamName,
    startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : null,
    endCursorParamName,
    endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
  };
}
