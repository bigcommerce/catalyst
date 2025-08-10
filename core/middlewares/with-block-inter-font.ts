// Middleware to block Google Fonts Inter CSS requests
import { MiddlewareFactory } from '~/middlewares/compose-middlewares';
import { NextResponse } from 'next/server';

export const withBlockInterFont: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const url = request.nextUrl;
    if (url.pathname === '/css' && url.searchParams.get('family')?.includes('Inter')) {
      return new NextResponse('Blocked by middleware', { status: 403 });
    }
    return next(request, event);
  };
};
