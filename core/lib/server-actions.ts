import { NextRequest } from 'next/server';

// See https://github.com/vercel/next.js/blob/main/packages/next/src/server/lib/server-action-request-meta.ts
export const isServerAction = ({ method, headers }: NextRequest) =>
  method === 'POST' &&
  (headers.get('next-action') != null ||
    headers.get('content-type') === 'application/x-www-form-urlencoded' ||
    headers.get('content-type')?.startsWith('multipart/form-data'));