import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.SENTRY_AUTH_TOKEN) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  }
}

// Manually typed from https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#parameters
export const onRequestError = (
  error: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[]>;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'proxy';
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering';
    revalidateReason: 'on-demand' | 'stale' | undefined;
    renderType: 'dynamic' | 'dynamic-resume';
  },
): void | Promise<void> => {
  if (process.env.SENTRY_AUTH_TOKEN) {
    Sentry.captureRequestError(error, request, context);
  }
};
