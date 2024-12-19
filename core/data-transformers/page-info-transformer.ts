import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

/**
 * Utility function to convert GraphQL PageInfo object into CursorPaginationInfo
 *
 * @param {PageInfo | undefined} pageInfo - The PageInfo object to transform
 * @returns {CursorPaginationInfo}
 */
export function pageInfoTransformer(pageInfo: PageInfo | undefined): CursorPaginationInfo {
  return {
    startCursorParamName: 'before',
    startCursor: pageInfo?.hasPreviousPage ? pageInfo.startCursor : null,
    endCursorParamName: 'after',
    endCursor: pageInfo?.hasNextPage ? pageInfo.endCursor : null,
  };
}
